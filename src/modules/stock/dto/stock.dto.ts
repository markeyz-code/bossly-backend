import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class RestockDto {
  @ApiProperty()
  @IsString()
  variantId: string;

  @ApiProperty({ example: 20 })
  @IsInt()
  @Min(1)
  @Max(100000)
  quantity: number;

  @ApiPropertyOptional({ example: 450000 })
  @IsInt()
  @Min(0)
  @IsOptional()
  unitCostKobo?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  note?: string;
}

export class AdjustStockDto {
  @ApiProperty()
  @IsString()
  variantId: string;

  @ApiProperty({ example: -2, description: 'Use a negative number to reduce stock' })
  @IsInt()
  @Min(-100000)
  @Max(100000)
  delta: number;

  @ApiProperty({ example: 'Damaged in transit' })
  @IsString()
  note: string;
}

export class StockQueryDto {
  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsIn(['sale', 'restock', 'adjustment', 'return', 'cancellation', 'initial'])
  type?: string;

  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 30;
}
