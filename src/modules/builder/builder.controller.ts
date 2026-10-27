import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentBusiness, CurrentUser, Permissions } from '../../common/decorators/auth.decorators';
import { PERMISSIONS } from '../../common/constants/permissions';
import { BuilderService } from './builder.service';
import { UpdateBusinessDto } from '../businesses/dto/business.dto';
import type { AuthenticatedUser } from '../../common/types/auth.types';

@ApiTags('Website builder')
@ApiBearerAuth()
@Controller('builder')
export class BuilderController {
  constructor(private readonly builder: BuilderService) {}

  @Get()
  @Permissions(PERMISSIONS.WEBSITE_MANAGE)
  get(@CurrentBusiness() businessId: string) {
    return this.builder.get(businessId);
  }

  @Get('templates')
  @Permissions(PERMISSIONS.WEBSITE_MANAGE)
  templates() {
    return this.builder.templates();
  }

  @Patch()
  @Permissions(PERMISSIONS.WEBSITE_MANAGE)
  update(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentBusiness() businessId: string,
    @Body() dto: UpdateBusinessDto,
  ) {
    return this.builder.update(user, businessId, dto);
  }

  @Post('publish')
  @Permissions(PERMISSIONS.WEBSITE_MANAGE)
  publish(@CurrentUser() user: AuthenticatedUser, @CurrentBusiness() businessId: string) {
    return this.builder.publish(user, businessId);
  }

  @Post('unpublish')
  @Permissions(PERMISSIONS.WEBSITE_MANAGE)
  unpublish(@CurrentUser() user: AuthenticatedUser, @CurrentBusiness() businessId: string) {
    return this.builder.unpublish(user, businessId);
  }
}
