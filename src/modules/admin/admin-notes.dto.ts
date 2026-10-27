import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class AdminNoteTargetQueryDto {
  @ApiProperty({ enum: ['user', 'business'] })
  @IsIn(['user', 'business'])
  targetType: 'user' | 'business';

  @ApiProperty()
  @IsString()
  targetId: string;
}

export class CreateAdminNoteDto extends AdminNoteTargetQueryDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(2000)
  body: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  pinned?: boolean;
}

export class UpdateAdminNoteDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(2000)
  body?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  pinned?: boolean;
}
