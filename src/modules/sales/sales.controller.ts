import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentBusiness, CurrentUser, Permissions } from '../../common/decorators/auth.decorators';
import { PERMISSIONS } from '../../common/constants/permissions';
import { SalesService } from './sales.service';
import { CreateSaleDto, SaleQueryDto } from './dto/sale.dto';
import type { AuthenticatedUser } from '../../common/types/auth.types';

@ApiTags('Sales')
@ApiBearerAuth()
@Controller('sales')
export class SalesController {
  constructor(private readonly sales: SalesService) {}

  @Get()
  @Permissions(PERMISSIONS.SALES_READ)
  list(@CurrentBusiness() businessId: string, @Query() query: SaleQueryDto) {
    return this.sales.list(businessId, query);
  }

  @Get(':id')
  @Permissions(PERMISSIONS.SALES_READ)
  findOne(@CurrentBusiness() businessId: string, @Param('id') id: string) {
    return this.sales.findOne(businessId, id);
  }

  @Post()
  @Permissions(PERMISSIONS.SALES_WRITE)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentBusiness() businessId: string,
    @Body() dto: CreateSaleDto,
  ) {
    return this.sales.create(user.id, businessId, dto);
  }

  @Post(':id/void')
  @Permissions(PERMISSIONS.SALES_WRITE)
  voidSale(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentBusiness() businessId: string,
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    return this.sales.voidSale(user.id, businessId, id, body?.reason || 'Voided by owner');
  }

  @Post(':id/receipt/resend')
  @Permissions(PERMISSIONS.SALES_WRITE)
  resendReceipt(@CurrentBusiness() businessId: string, @Param('id') id: string) {
    return this.sales.resendReceipt(businessId, id);
  }
}
