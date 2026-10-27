import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
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

export class OrderLineDto {
  @ApiProperty()
  @IsString()
  productId: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  variantId?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  @Max(100000)
  quantity: number;

  @ApiPropertyOptional({ description: 'Override catalogue unit price in kobo. Ignored for public storefront orders.' })
  @IsInt()
  @Min(0)
  @IsOptional()
  unitPriceKobo?: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'Tola Adeyemi' })
  @IsString()
  @MaxLength(100)
  customerName: string;

  @ApiProperty({ example: '08031234567' })
  @IsString()
  @MaxLength(20)
  customerPhone: string;

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  customerEmail?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(300)
  deliveryAddress?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(500)
  deliveryDetails?: string;

  @ApiProperty({ type: [OrderLineDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderLineDto)
  items: OrderLineDto[];

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @IsOptional()
  discountKobo?: number;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @IsOptional()
  deliveryFeeKobo?: number;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @IsOptional()
  amountPaidKobo?: number;

  @ApiPropertyOptional({ enum: ['cash', 'transfer', 'paystack', 'pos', 'other'] })
  @IsIn(['cash', 'transfer', 'paystack', 'pos', 'other'])
  @IsOptional()
  paymentMethod?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  createDebtNow?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;

  @ApiPropertyOptional({ enum: ['manual', 'storefront', 'whatsapp', 'paste_chat', 'embed'] })
  @IsIn(['manual', 'storefront', 'whatsapp', 'paste_chat', 'embed'])
  @IsOptional()
  source?: 'manual' | 'storefront' | 'whatsapp' | 'paste_chat' | 'embed';

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  whatsappMessage?: string;
}

export class OrderPaymentDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  amountKobo: number;

  @ApiPropertyOptional({ enum: ['cash', 'transfer', 'paystack', 'pos', 'other'] })
  @IsIn(['cash', 'transfer', 'paystack', 'pos', 'other'])
  @IsOptional()
  method?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  reference?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  note?: string;
}

export class CancelOrderDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(300)
  reason?: string;
}

export class DeliverOrderDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(300)
  note?: string;
}

export class OrderQueryDto {
  @ApiPropertyOptional({ enum: ['all', 'pending', 'confirmed', 'paid', 'delivered', 'cancelled'] })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  from?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  to?: string;

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
