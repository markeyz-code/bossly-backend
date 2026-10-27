import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Post,
  Query,
  RawBodyRequest,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { createHmac, timingSafeEqual } from 'crypto';
import type { Request, Response } from 'express';
import { Model } from 'mongoose';
import { Public } from '../../common/decorators/public.decorator';
import { WhatsappClientService } from './whatsapp-client.service';
import { WhatsappMessage, WhatsappMessageDocument } from './whatsapp-message.schema';
import { BotService } from './bot.service';

@ApiExcludeController()
@Controller('whatsapp')
export class WhatsappWebhookController {
  constructor(
    private readonly config: ConfigService,
    private readonly client: WhatsappClientService,
    private readonly bot: BotService,
    @InjectModel(WhatsappMessage.name) private readonly messages: Model<WhatsappMessageDocument>,
  ) {}

  @Public()
  @Get('webhook')
  verify(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ): void {
    if (mode === 'subscribe' && token === this.config.get('whatsapp.verifyToken')) {
      res.status(200).send(challenge);
      return;
    }
    res.status(403).send('Forbidden');
  }

  @Public()
  @Post('webhook')
  @HttpCode(200)
  async receive(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-hub-signature-256') signature: string | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    const secret = this.config.get('whatsapp.appSecret');
    if (!secret) throw new UnauthorizedException('WhatsApp app secret is not configured.');
    if (!req.rawBody || !signature) throw new UnauthorizedException('Missing WhatsApp signature.');
    const expected = `sha256=${createHmac('sha256', secret).update(req.rawBody).digest('hex')}`;
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) throw new UnauthorizedException('Invalid WhatsApp signature.');

    const entries = (body.entry as unknown[]) || [];
    for (const entry of entries) {
      const changes = ((entry as Record<string, unknown>).changes as unknown[]) || [];
      for (const change of changes) {
        const value = (change as Record<string, unknown>).value as Record<string, unknown> | undefined;
        if (!value) continue;
        const statuses = (value.statuses as unknown[]) || [];
        for (const s of statuses) {
          const st = s as Record<string, unknown>;
          if (st.id && st.status) {
            await this.client.updateStatus(
              String(st.id),
              st.status as 'sent' | 'delivered' | 'read' | 'failed',
              Array.isArray(st.errors) ? JSON.stringify(st.errors).slice(0, 500) : undefined,
            );
          }
        }
        const messages = (value.messages as unknown[]) || [];
        for (const m of messages) {
          const msg = m as Record<string, unknown>;
          const from = String(msg.from || '');
          const id = String(msg.id || '');
          if (!from || !id) continue;
          const contacts = (value.contacts as unknown[]) || [];
          const profile = (contacts[0] as Record<string, unknown> | undefined)?.profile as Record<string, unknown> | undefined;
          const text = ((msg.text as Record<string, unknown> | undefined)?.body as string) || '';
          const type = String(msg.type || 'unknown');
          await this.client.recordInbound({
            phone: from,
            body: text || `[${type}]`,
            metaMessageId: id,
            displayName: profile?.name ? String(profile.name) : undefined,
            messageType: type,
            timestamp: msg.timestamp ? new Date(Number(msg.timestamp) * 1000) : undefined,
          });
          // Claim this message exactly once, even if Meta retries the webhook.
          const claimed = await this.messages.findOneAndUpdate(
            { metaMessageId: id, botProcessedAt: null },
            { $set: { botProcessedAt: new Date() } },
            { new: true },
          ).exec();
          if (!claimed) continue;
          if (type !== 'text') {
            await this.client.sendTextDirect('', from, 'I can only read text right now. Send your sale as a message, for example: sold 2 shirts 5000, Tola owes 2000.');
            continue;
          }
          await this.bot.handleIncoming({ phone: from, name: profile?.name ? String(profile.name) : undefined, text });
        }
      }
    }
    return { received: true };
  }
}
