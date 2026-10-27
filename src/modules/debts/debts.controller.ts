import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentBusiness, CurrentUser, Permissions } from '../../common/decorators/auth.decorators';
import { Public } from '../../common/decorators/public.decorator';
import { PERMISSIONS } from '../../common/constants/permissions';
import { DebtsService } from './debts.service';
import { CreateDebtDto, DebtQueryDto, RecordDebtPaymentDto, RemindDebtDto } from './dto/debt.dto';
import type { AuthenticatedUser } from '../../common/types/auth.types';

@ApiTags('Debts')
@Controller()
export class DebtsController {
  constructor(private readonly debts: DebtsService) {}

  @ApiBearerAuth()
  @Get('debts')
  @Permissions(PERMISSIONS.DEBTS_READ)
  list(@CurrentBusiness() businessId: string, @Query() query: DebtQueryDto) {
    return this.debts.list(businessId, query);
  }

  @ApiBearerAuth()
  @Get('debts/summary')
  @Permissions(PERMISSIONS.DEBTS_READ)
  summary(@CurrentBusiness() businessId: string) {
    return this.debts.summary(businessId);
  }

  @ApiBearerAuth()
  @Get('debts/:id')
  @Permissions(PERMISSIONS.DEBTS_READ)
  findOne(@CurrentBusiness() businessId: string, @Param('id') id: string) {
    return this.debts.findOne(businessId, id);
  }

  @ApiBearerAuth()
  @Post('debts')
  @Permissions(PERMISSIONS.DEBTS_WRITE)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentBusiness() businessId: string,
    @Body() dto: CreateDebtDto,
  ) {
    return this.debts.create(user.id, businessId, dto);
  }

  @ApiBearerAuth()
  @Post('debts/:id/payments')
  @Permissions(PERMISSIONS.DEBTS_WRITE)
  recordPayment(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentBusiness() businessId: string,
    @Param('id') id: string,
    @Body() dto: RecordDebtPaymentDto,
  ) {
    return this.debts.recordPayment(user.id, businessId, id, dto);
  }

  @ApiBearerAuth()
  @Post('debts/:id/remind')
  @Permissions(PERMISSIONS.DEBTS_WRITE)
  remind(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentBusiness() businessId: string,
    @Param('id') id: string,
    @Body() dto: RemindDebtDto,
  ) {
    return this.debts.sendReminder(user.id, businessId, id, dto.channel || 'whatsapp');
  }

  @Public()
  @Get('public/debts/:token')
  publicDebt(@Param('token') token: string) {
    return this.debts.publicByToken(token);
  }
}
