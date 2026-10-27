import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WhatsappClientService } from './whatsapp-client.service';
import { WhatsappContact, WhatsappContactSchema } from './whatsapp-contact.schema';
import { WhatsappMessage, WhatsappMessageSchema } from './whatsapp-message.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WhatsappContact.name, schema: WhatsappContactSchema },
      { name: WhatsappMessage.name, schema: WhatsappMessageSchema },
    ]),
  ],
  providers: [WhatsappClientService],
  exports: [WhatsappClientService, MongooseModule],
})
export class WhatsappClientModule {}
