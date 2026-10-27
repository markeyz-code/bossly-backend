import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min } from 'class-validator';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class UpdateAffiliateDetailsDto {
  @ApiProperty({ example: 'GTBank' })
  @Transform(trim)
  @IsString()
  @MaxLength(80)
  bankName: string;

  @ApiProperty({ example: 'Tola Adeyemi' })
  @Transform(trim)
  @IsString()
  @MaxLength(100)
  accountName: string;

  @ApiProperty({ example: '0123456789' })
  @Transform(trim)
  @IsString()
  @Matches(/^\d{10}$/, { message: 'Enter a valid 10-digit NUBAN account number.' })
  accountNumber: string;
}

export class RequestAffiliatePayoutDto extends UpdateAffiliateDetailsDto {
  @ApiProperty({ example: 200000, description: 'Amount in kobo' })
  @IsInt()
  @Min(100000, { message: 'The minimum payout is ₦1,000.' })
  @Max(100000000, { message: 'That payout amount is too large.' })
  amountKobo: number;
}

export class AdminPayoutQueryDto {
  @ApiPropertyOptional({ enum: ['requested', 'paid', 'rejected', 'all'] })
  @IsOptional()
  @IsIn(['requested', 'paid', 'rejected', 'all'])
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 30 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

export class AdminUpdatePayoutDto {
  @ApiProperty({ enum: ['paid', 'rejected'] })
  @IsIn(['paid', 'rejected'])
  status: 'paid' | 'rejected';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  reference?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
