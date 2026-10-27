import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class SaleLineDto {
  @ApiProperty()
  @IsString()
  productId: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  variantId?: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  @Max(100000)
  quantity: number;

  @ApiPropertyOptional({ description: 'Override the catalogue unit price, in kobo (discounts/negotiated sales).' })
  @IsInt()
  @Min(0)
  @IsOptional()
  unitPriceKobo?: number;
}

export class CreateSaleDto {
  @ApiPropertyOptional({ example: 'Tola Adeyemi' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  customerName?: string;

  @ApiPropertyOptional({ example: '08031234567' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  customerPhone?: string;

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  customerEmail?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  customerId?: string;

  @ApiProperty({ type: [SaleLineDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SaleLineDto)
  items: SaleLineDto[];

  @ApiPropertyOptional({ example: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  discountKobo?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  deliveryFeeKobo?: number;

  @ApiPropertyOptional({ example: 1500000, description: 'Amount collected now (kobo)' })
  @IsInt()
  @Min(0)
  @IsOptional()
  amountPaidKobo?: number;

  @ApiPropertyOptional({ enum: ['cash', 'transfer', 'paystack', 'pos', 'other'], default: 'cash' })
  @IsIn(['cash', 'transfer', 'paystack', 'pos', 'other'])
  @IsOptional()
  paymentMethod?: string;

  @ApiPropertyOptional({ example: '2026-11-01' })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  soldAt?: string;

  @ApiPropertyOptional({ enum: ['manual', 'whatsapp', 'storefront', 'paste_chat', 'embed'] })
  @IsIn(['manual', 'whatsapp', 'storefront', 'paste_chat', 'embed'])
  @IsOptional()
  source?: string;
}

export class SaleQueryDto {
  @ApiPropertyOptional({ enum: ['today', 'week', 'month', 'all'] })
  @IsOptional()
  period?: 'today' | 'week' | 'month' | 'all';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  from?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  to?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ['paid', 'partial', 'unpaid'] })
  @IsOptional()
  @IsString()
  paymentStatus?: string;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page = 1;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit = 20;
}
