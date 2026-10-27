import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CurrentBusiness, Permissions } from '../../common/decorators/auth.decorators';
import { PERMISSIONS } from '../../common/constants/permissions';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, CustomerQueryDto, UpdateCustomerDto } from './dto/customer.dto';

class LookupCustomerQuery {
  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  email?: string;
}

@ApiTags('Customers')
@ApiBearerAuth()
@Controller('customers')
export class CustomersController {
  constructor(private readonly customers: CustomersService) {}

  @Get()
  @Permissions(PERMISSIONS.CUSTOMERS_READ)
  list(@CurrentBusiness() businessId: string, @Query() query: CustomerQueryDto) {
    return this.customers.list(businessId, query);
  }

  @Get('lookup')
  @Permissions(PERMISSIONS.CUSTOMERS_READ)
  lookup(@CurrentBusiness() businessId: string, @Query() query: LookupCustomerQuery) {
    return this.customers.findOrCreate(businessId, query);
  }

  @Get(':id')
  @Permissions(PERMISSIONS.CUSTOMERS_READ)
  findOne(@CurrentBusiness() businessId: string, @Param('id') id: string) {
    return this.customers.findOne(businessId, id);
  }

  @Post()
  @Permissions(PERMISSIONS.CUSTOMERS_WRITE)
  create(@CurrentBusiness() businessId: string, @Body() dto: CreateCustomerDto) {
    return this.customers.create(businessId, dto);
  }

  @Patch(':id')
  @Permissions(PERMISSIONS.CUSTOMERS_WRITE)
  update(@CurrentBusiness() businessId: string, @Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.customers.update(businessId, id, dto);
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.CUSTOMERS_WRITE)
  remove(@CurrentBusiness() businessId: string, @Param('id') id: string) {
    return this.customers.remove(businessId, id);
  }
}
