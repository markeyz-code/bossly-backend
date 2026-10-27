import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';
import { CurrentBusiness, CurrentUser, Permissions } from '../../common/decorators/auth.decorators';
import { PERMISSIONS } from '../../common/constants/permissions';
import { ChatParserService } from './chat-parser.service';
import { OrdersService } from '../orders/orders.service';
import { CreateOrderDto } from '../orders/dto/order.dto';
import type { AuthenticatedUser } from '../../common/types/auth.types';

class ParseChatDto {
  @ApiProperty({ example: 'Hi, I want 2 black hoodies and 1 cap. My name is Tola, 08031234567. Deliver to Yaba.' })
  @IsString()
  @MaxLength(8000)
  text: string;
}

@ApiTags('WhatsApp')
@ApiBearerAuth()
@Controller('whatsapp/paste-chat')
export class PasteChatController {
  constructor(
    private readonly parser: ChatParserService,
    private readonly orders: OrdersService,
  ) {}

  @Post()
  @Permissions(PERMISSIONS.ORDERS_WRITE)
  async parse(@CurrentBusiness() businessId: string, @Body() dto: ParseChatDto) {
    if (!dto.text?.trim()) throw new BadRequestException('Paste a conversation first.');
    const draft = await this.parser.parse(businessId, dto.text);
    return {
      ...draft,
      draftOrder: {
        customerName: draft.customerName,
        customerPhone: draft.customerPhone,
        deliveryAddress: draft.deliveryAddress,
        items: draft.items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
          unitPriceKobo: i.quotedUnitPriceKobo ?? i.unitPriceKobo,
        })),
        amountPaidKobo: draft.amountPaidKobo ?? 0,
        dueDate: draft.dueDate,
        discountKobo: draft.totals.discountKobo,
        deliveryFeeKobo: draft.deliveryFeeKobo,
        notes: draft.notes,
      },
    };
  }

  @Post('confirm')
  @Permissions(PERMISSIONS.ORDERS_WRITE)
  confirm(@CurrentUser() user: AuthenticatedUser, @CurrentBusiness() businessId: string, @Body() dto: CreateOrderDto) {
    return this.orders.create(user.id, businessId, dto, 'paste_chat');
  }
}
