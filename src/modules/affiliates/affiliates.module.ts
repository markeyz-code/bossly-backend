import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AffiliatesController } from './affiliates.controller';
import { AffiliatesService } from './affiliates.service';
import { Affiliate, AffiliateSchema } from './affiliate.schema';
import { Referral, ReferralSchema } from './referral.schema';
import { AffiliatePayout, AffiliatePayoutSchema } from './affiliate-payout.schema';
import { Business, BusinessSchema } from '../businesses/business.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Affiliate.name, schema: AffiliateSchema },
      { name: Referral.name, schema: ReferralSchema },
      { name: AffiliatePayout.name, schema: AffiliatePayoutSchema },
      { name: Business.name, schema: BusinessSchema },
    ]),
  ],
  controllers: [AffiliatesController],
  providers: [AffiliatesService],
  exports: [AffiliatesService, MongooseModule],
})
export class AffiliatesModule {}
