import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from './notification.schema';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { AlertsService } from './alerts.service';
import { Business, BusinessSchema } from '../businesses/business.schema';
import { Membership, MembershipSchema } from '../memberships/membership.schema';
import { User, UserSchema } from '../users/user.schema';
import { Product, ProductSchema } from '../products/product.schema';
import { WhatsappContact, WhatsappContactSchema } from '../whatsapp/whatsapp-contact.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: Business.name, schema: BusinessSchema },
      { name: Membership.name, schema: MembershipSchema },
      { name: User.name, schema: UserSchema },
      { name: Product.name, schema: ProductSchema },
      { name: WhatsappContact.name, schema: WhatsappContactSchema },
    ]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, AlertsService],
  exports: [NotificationsService, AlertsService],
})
export class NotificationsModule {}
