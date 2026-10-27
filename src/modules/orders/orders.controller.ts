import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentBusiness, CurrentUser, Permissions } from '../../common/decorators/auth.decorators';
import { Public } from '../../common/decorators/public.decorator';
import { PERMISSIONS } from '../../common/constants/permissions';
import { OrdersService } from './orders.service';
import {
  CancelOrderDto,
  CreateOrderDto,
  DeliverOrderDto,
  OrderPaymentDto,
  OrderQueryDto,
} from './dto/order.dto';
import type { AuthenticatedUser } from '../../common/types/auth.types';

@ApiTags('Orders')
@Controller()
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @ApiBearerAuth()
  @Get('orders')
  @Permissions(PERMISSIONS.ORDERS_READ)
  list(@CurrentBusiness() businessId: string, @Query() query: OrderQueryDto) {
    return this.orders.list(businessId, query);
  }

  @ApiBearerAuth()
  @Get('orders/:id')
  @Permissions(PERMISSIONS.ORDERS_READ)
  findOne(@CurrentBusiness() businessId: string, @Param('id') id: string) {
    return this.orders.findOne(businessId, id);
  }

  @ApiBearerAuth()
  @Post('orders')
  @Permissions(PERMISSIONS.ORDERS_WRITE)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentBusiness() businessId: string,
    @Body() dto: CreateOrderDto,
  ) {
    return this.orders.create(user.id, businessId, dto);
  }

  @ApiBearerAuth()
  @Post('orders/:id/confirm')
  @Permissions(PERMISSIONS.ORDERS_WRITE)
  confirm(@CurrentUser() user: AuthenticatedUser, @CurrentBusiness() businessId: string, @Param('id') id: string) {
    return this.orders.confirm(user.id, businessId, id);
  }

  @ApiBearerAuth()
  @Post('orders/:id/payments')
  @Permissions(PERMISSIONS.ORDERS_WRITE)
  pay(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentBusiness() businessId: string,
    @Param('id') id: string,
    @Body() dto: OrderPaymentDto,
  ) {
    return this.orders.recordPayment(user.id, businessId, id, dto);
  }

  @ApiBearerAuth()
  @Patch('orders/:id/deliver')
  @Permissions(PERMISSIONS.ORDERS_WRITE)
  deliver(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentBusiness() businessId: string,
    @Param('id') id: string,
    @Body() dto: DeliverOrderDto,
  ) {
    return this.orders.deliver(user.id, businessId, id, dto);
  }

  @ApiBearerAuth()
  @Post('orders/:id/cancel')
  @Permissions(PERMISSIONS.ORDERS_WRITE)
  cancel(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentBusiness() businessId: string,
    @Param('id') id: string,
    @Body() dto: CancelOrderDto,
  ) {
    return this.orders.cancel(user.id, businessId, id, dto);
  }

  @Public()
  @Get('public/orders/:token')
  publicOrder(@Param('token') token: string) {
    return this.orders.publicByToken(token);
  }
}
