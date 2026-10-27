import { Controller, Delete, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentBusiness } from '../../common/decorators/auth.decorators';
import { NotificationsService } from './notifications.service';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

class ListNotificationsQuery {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit = 20;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  unreadOnly?: boolean;

  @IsOptional()
  @IsString()
  type?: string;
}

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  list(@CurrentBusiness() businessId: string, @Query() query: ListNotificationsQuery) {
    return this.notifications.list(businessId, {
      page: query.page,
      limit: query.limit,
      unreadOnly: query.unreadOnly,
      type: query.type,
    });
  }

  @Patch('read-all')
  readAll(@CurrentBusiness() businessId: string) {
    return this.notifications.markAllRead(businessId);
  }

  @Patch(':id/read')
  read(@CurrentBusiness() businessId: string, @Param('id') id: string) {
    return this.notifications.markRead(businessId, id);
  }

  @Delete(':id')
  remove(@CurrentBusiness() businessId: string, @Param('id') id: string) {
    return this.notifications.remove(businessId, id);
  }
}
