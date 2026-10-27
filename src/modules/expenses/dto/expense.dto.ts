import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional, IsString, IsUrl, Max, MaxLength, Min } from 'class-validator';

export const EXPENSE_CATEGORY_KEYS = ['stock_purchase', 'transport', 'data', 'packaging', 'rent', 'ads', 'other'] as const;

export class CreateExpenseDto {
  @ApiProperty({ enum: EXPENSE_CATEGORY_KEYS })
  @IsIn(EXPENSE_CATEGORY_KEYS as unknown as string[])
  category: string;

  @ApiProperty({ example: 150000 })
  @IsInt()
  @Min(1)
  amountKobo: number;

  @ApiProperty()
  @IsDateString()
  date: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;

  @ApiPropertyOptional()
  @IsUrl({ require_protocol: true })
  @IsOptional()
  receiptUrl?: string;

  @ApiPropertyOptional({ enum: ['none', 'daily', 'weekly', 'monthly'] })
  @IsIn(['none', 'daily', 'weekly', 'monthly'])
  @IsOptional()
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  recurrenceEndsAt?: string;
}

export class UpdateExpenseDto {
  @ApiPropertyOptional({ enum: EXPENSE_CATEGORY_KEYS })
  @IsIn(EXPENSE_CATEGORY_KEYS as unknown as string[])
  @IsOptional()
  category?: string;

  @ApiPropertyOptional()
  @IsInt()
  @Min(1)
  @IsOptional()
  amountKobo?: number;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;

  @ApiPropertyOptional()
  @IsUrl({ require_protocol: true })
  @IsOptional()
  receiptUrl?: string;

  @ApiPropertyOptional({ enum: ['none', 'daily', 'weekly', 'monthly'] })
  @IsIn(['none', 'daily', 'weekly', 'monthly'])
  @IsOptional()
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
}

export class ExpenseQueryDto {
  @ApiPropertyOptional({ enum: EXPENSE_CATEGORY_KEYS })
  @IsOptional()
  @IsString()
  category?: string;

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
