import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentBusiness, CurrentUser, Roles } from '../../common/decorators/auth.decorators';
import { AffiliatesService } from './affiliates.service';
import { RequestAffiliatePayoutDto, UpdateAffiliateDetailsDto } from './dto/affiliate.dto';
import type { AuthenticatedUser } from '../../common/types/auth.types';

@ApiTags('Affiliates')
@ApiBearerAuth()
@Roles('owner')
@Controller('affiliates')
export class AffiliatesController {
  constructor(private readonly affiliates: AffiliatesService) {}

  @Get('me')
  me(@CurrentBusiness() businessId: string) {
    return this.affiliates.overview(businessId);
  }

  @Get('payouts')
  async payouts(@CurrentBusiness() businessId: string) {
    return (await this.affiliates.overview(businessId)).payouts;
  }

  @Patch('payout-details')
  updateDetails(@CurrentBusiness() businessId: string, @Body() dto: UpdateAffiliateDetailsDto) {
    return this.affiliates.updateDetails(businessId, dto);
  }

  @Post('payouts')
  requestPayout(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentBusiness() businessId: string,
    @Body() dto: RequestAffiliatePayoutDto,
  ) {
    return this.affiliates.requestPayout(user.id, businessId, dto);
  }
}
