import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { CurrentBusiness } from '../../common/decorators/auth.decorators';
import { UploadsService } from './uploads.service';

class SignUploadDto {
  @ApiProperty({ enum: ['products', 'logo', 'banner', 'receipts', 'avatar', 'expenses', 'lookbook', 'story', 'video'] })
  @IsIn(['products', 'logo', 'banner', 'receipts', 'avatar', 'expenses', 'lookbook', 'story', 'video'])
  purpose: 'products' | 'logo' | 'banner' | 'receipts' | 'avatar' | 'expenses' | 'lookbook' | 'story' | 'video';
}

@ApiTags('Uploads')
@ApiBearerAuth()
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploads: UploadsService) {}

  @Post('sign')
  sign(@CurrentBusiness() businessId: string, @Body() dto: SignUploadDto) {
    return this.uploads.sign(businessId, dto.purpose);
  }
}
