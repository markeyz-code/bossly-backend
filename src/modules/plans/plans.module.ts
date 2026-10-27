import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Plan, PlanSchema } from './plan.schema';
import { Subscription, SubscriptionSchema } from './subscription.schema';
import { Coupon, CouponSchema } from './coupon.schema';
import { PlansService } from './plans.service';
import { PlansController } from './plans.controller';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Plan.name, schema: PlanSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: Coupon.name, schema: CouponSchema },
    ]),
  ],
  controllers: [PlansController],
  providers: [PlansService],
  exports: [PlansService, MongooseModule],
})
export class PlansModule {}
