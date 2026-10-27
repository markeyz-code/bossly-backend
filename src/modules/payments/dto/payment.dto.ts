import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString } from 'class-validator';

export class CreatePaymentLinkDto {
  @ApiPropertyOptional({ description: 'Override email; defaults to the customer or business email' })
  @IsEmail()
  @IsOptional()
  email?: string;
}

export class SubscriptionCheckoutDto {
  @ApiProperty({ example: 'hustle' })
  @IsString()
  planKey: string;

  @ApiPropertyOptional({ enum: ['monthly', 'yearly'], default: 'monthly' })
  @IsIn(['monthly', 'yearly'])
  @IsOptional()
  interval?: 'monthly' | 'yearly';

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  couponCode?: string;
}

export class PublicDebtPaymentDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}

export class VerifyPaymentDto {
  @ApiProperty()
  @IsString()
  reference: string;
}
