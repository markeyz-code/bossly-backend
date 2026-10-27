import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class ReportQueryDto {
  @ApiPropertyOptional({ enum: ['today', 'week', 'month', 'last_month', 'custom'] })
  @IsIn(['today', 'week', 'month', 'last_month', 'custom'])
  @IsOptional()
  range?: 'today' | 'week' | 'month' | 'last_month' | 'custom';

  @ApiPropertyOptional({ example: '2026-01-01' })
  @IsString()
  @IsOptional()
  from?: string;

  @ApiPropertyOptional({ example: '2026-01-31' })
  @IsString()
  @IsOptional()
  to?: string;
}
