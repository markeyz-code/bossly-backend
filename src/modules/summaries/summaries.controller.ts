import { Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { CurrentBusiness, Permissions } from '../../common/decorators/auth.decorators';
import { PERMISSIONS } from '../../common/constants/permissions';
import { SummariesService, SummaryPeriod } from './summaries.service';

class SummaryQuery {
  @IsOptional()
  @IsIn(['daily', 'weekly'])
  period?: SummaryPeriod;
}

@ApiTags('Summaries')
@ApiBearerAuth()
@Controller('summaries')
export class SummariesController {
  constructor(private readonly summaries: SummariesService) {}

  @Get('preview')
  @Permissions(PERMISSIONS.SALES_READ)
  preview(@CurrentBusiness() businessId: string, @Query() query: SummaryQuery) {
    return this.summaries.preview(businessId, query.period || 'daily');
  }

  @Post('send')
  @Permissions(PERMISSIONS.SETTINGS_MANAGE)
  send(@CurrentBusiness() businessId: string, @Query() query: SummaryQuery) {
    return this.summaries.sendNow(businessId, query.period || 'daily');
  }
}
