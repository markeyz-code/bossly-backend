import { Body, Controller, Get, Param, Patch, Post, Query, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { CurrentBusiness, CurrentUser, Permissions, RawResponse } from '../../common/decorators/auth.decorators';
import { Public } from '../../common/decorators/public.decorator';
import { PERMISSIONS } from '../../common/constants/permissions';
import { ReceiptsService } from './receipts.service';
import { CreateInvoiceDto, InvoiceQueryDto, ReceiptQueryDto } from './dto/receipt.dto';
import type { AuthenticatedUser } from '../../common/types/auth.types';

@ApiTags('Receipts & Invoices')
@Controller()
export class ReceiptsController {
  constructor(private readonly receipts: ReceiptsService) {}

  @ApiBearerAuth()
  @Get('receipts')
  @Permissions(PERMISSIONS.SALES_READ)
  listReceipts(@CurrentBusiness() businessId: string, @Query() query: ReceiptQueryDto) {
    return this.receipts.list(businessId, query);
  }

  @ApiBearerAuth()
  @Get('receipts/:id')
  @Permissions(PERMISSIONS.SALES_READ)
  getReceipt(@CurrentBusiness() businessId: string, @Param('id') id: string) {
    return this.receipts.findOne(businessId, id);
  }

  @ApiBearerAuth()
  @Get('invoices')
  @Permissions(PERMISSIONS.SALES_READ)
  listInvoices(@CurrentBusiness() businessId: string, @Query() query: InvoiceQueryDto) {
    return this.receipts.listInvoices(businessId, query);
  }

  @ApiBearerAuth()
  @Get('invoices/:id')
  @Permissions(PERMISSIONS.SALES_READ)
  getInvoice(@CurrentBusiness() businessId: string, @Param('id') id: string) {
    return this.receipts.findInvoice(businessId, id);
  }

  @ApiBearerAuth()
  @Post('invoices')
  @Permissions(PERMISSIONS.SALES_WRITE)
  createInvoice(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentBusiness() businessId: string,
    @Body() dto: CreateInvoiceDto,
  ) {
    return this.receipts.createInvoice(user.id, businessId, dto);
  }

  @ApiBearerAuth()
  @Post('invoices/:id/send')
  @Permissions(PERMISSIONS.SALES_WRITE)
  sendInvoice(@CurrentBusiness() businessId: string, @Param('id') id: string) {
    return this.receipts.sendInvoiceEmail(id, businessId);
  }

  @ApiBearerAuth()
  @Patch('invoices/:id/paid')
  @Permissions(PERMISSIONS.SALES_WRITE)
  markPaid(@CurrentBusiness() businessId: string, @Param('id') id: string) {
    return this.receipts.markInvoicePaid(businessId, id);
  }

  @Public()
  @Get('public/receipts/:token')
  publicReceipt(@Param('token') token: string) {
    return this.receipts.publicReceipt(token);
  }

  @Public()
  @RawResponse()
  @Get('public/receipts/:token/pdf')
  async publicReceiptPdf(@Param('token') token: string, @Res() res: Response) {
    const buffer = await this.receipts.receiptPdf(token);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="receipt.pdf"');
    res.send(buffer);
  }

  @Public()
  @Get('public/invoices/:token')
  publicInvoice(@Param('token') token: string) {
    return this.receipts.publicInvoice(token);
  }

  @Public()
  @RawResponse()
  @Get('public/invoices/:token/pdf')
  async publicInvoicePdf(@Param('token') token: string, @Res() res: Response) {
    const buffer = await this.receipts.invoicePdf(token);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="invoice.pdf"');
    res.send(buffer);
  }
}
