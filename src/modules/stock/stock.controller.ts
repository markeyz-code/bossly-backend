import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentBusiness, CurrentUser, Permissions } from '../../common/decorators/auth.decorators';
import { PERMISSIONS } from '../../common/constants/permissions';
import { StockService } from './stock.service';
import { AdjustStockDto, RestockDto, StockQueryDto } from './dto/stock.dto';
import type { AuthenticatedUser } from '../../common/types/auth.types';

@ApiTags('Stock')
@ApiBearerAuth()
@Controller('stock')
export class StockController {
  constructor(private readonly stock: StockService) {}

  @Get('summary')
  @Permissions(PERMISSIONS.STOCK_READ)
  summary(@CurrentBusiness() businessId: string) {
    return this.stock.summary(businessId);
  }

  @Get('movements')
  @Permissions(PERMISSIONS.STOCK_READ)
  movements(@CurrentBusiness() businessId: string, @Query() query: StockQueryDto) {
    return this.stock.list(businessId, query);
  }

  @Post('products/:productId/restock')
  @Permissions(PERMISSIONS.STOCK_WRITE)
  restock(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentBusiness() businessId: string,
    @Param('productId') productId: string,
    @Body() dto: RestockDto,
  ) {
    return this.stock.restock(user.id, businessId, productId, dto.variantId, dto.quantity, dto.unitCostKobo, dto.note || '');
  }

  @Post('products/:productId/adjust')
  @Permissions(PERMISSIONS.STOCK_WRITE)
  adjust(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentBusiness() businessId: string,
    @Param('productId') productId: string,
    @Body() dto: AdjustStockDto,
  ) {
    return this.stock.adjust(user.id, businessId, productId, dto.variantId, dto.delta, dto.note);
  }
}
