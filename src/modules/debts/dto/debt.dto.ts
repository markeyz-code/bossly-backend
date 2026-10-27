import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateDebtDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  customerId?: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  customerName: string;

  @ApiProperty()
  @IsString()
  @MaxLength(20)
  customerPhone: string;

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  customerEmail?: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  amountKobo: number;

  @ApiProperty()
  @IsDateString()
  dueDate: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;
}

export class RecordDebtPaymentDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  amountKobo: number;

  @ApiPropertyOptional({ enum: ['cash', 'transfer', 'paystack', 'pos', 'other'], default: 'cash' })
  @IsIn(['cash', 'transfer', 'paystack', 'pos', 'other'])
  @IsOptional()
  method?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(120)
  reference?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(300)
  note?: string;
}

export class DebtQueryDto {
  @ApiPropertyOptional({ enum: ['all', 'unpaid', 'partial', 'overdue', 'paid'] })
  @IsOptional()
  @IsString()
  status?: 'all' | 'unpaid' | 'partial' | 'overdue' | 'paid';

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  customerId?: string;

  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page = 1;

  @ApiPropertyOptional({ default: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit = 20;
}

export class RemindDebtDto {
  @ApiPropertyOptional({ enum: ['whatsapp', 'email'], default: 'whatsapp' })
  @IsIn(['whatsapp', 'email'])
  @IsOptional()
  channel?: 'whatsapp' | 'email';
}
