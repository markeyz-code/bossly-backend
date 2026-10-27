import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Notification, NotificationDocument } from './notification.schema';

export interface CreateNotificationInput {
  businessId: string;
  userId?: string | null;
  type: string;
  title: string;
  message: string;
  tone?: 'info' | 'success' | 'warning' | 'danger';
  data?: Record<string, unknown>;
  channels?: string[];
  dedupeKey?: string | null;
}

@Injectable()
export class NotificationsService {
  constructor(@InjectModel(Notification.name) private readonly notifications: Model<NotificationDocument>) {}

  async create(input: CreateNotificationInput): Promise<NotificationDocument | null> {
    try {
      if (input.dedupeKey) {
        return await this.notifications.findOneAndUpdate(
          { businessId: input.businessId, dedupeKey: input.dedupeKey },
          { $setOnInsert: { ...input, dedupeKey: input.dedupeKey } },
          { upsert: true, new: true, setDefaultsOnInsert: true },
        ).exec();
      }
      return await this.notifications.create(input);
    } catch {
      return null;
    }
  }

  async list(
    businessId: string,
    opts: { page: number; limit: number; unreadOnly?: boolean; type?: string },
  ) {
    const filter: FilterQuery<NotificationDocument> = { businessId };
    if (opts.unreadOnly) filter.readAt = null;
    if (opts.type) filter.type = opts.type;
    const [items, total, unread] = await Promise.all([
      this.notifications
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((opts.page - 1) * opts.limit)
        .limit(opts.limit)
        .lean()
        .exec(),
      this.notifications.countDocuments(filter).exec(),
      this.notifications.countDocuments({ businessId, readAt: null }).exec(),
    ]);
    return {
      items,
      unread,
      meta: { total, page: opts.page, limit: opts.limit, pages: Math.ceil(total / opts.limit) },
    };
  }

  async markRead(businessId: string, notificationId: string): Promise<{ read: true }> {
    await this.notifications.updateOne(
      { _id: notificationId, businessId },
      { $set: { readAt: new Date() } },
    ).exec();
    return { read: true };
  }

  async markAllRead(businessId: string): Promise<{ read: true }> {
    await this.notifications.updateMany({ businessId, readAt: null }, { $set: { readAt: new Date() } }).exec();
    return { read: true };
  }

  async remove(businessId: string, notificationId: string): Promise<{ deleted: true }> {
    await this.notifications.deleteOne({ _id: notificationId, businessId }).exec();
    return { deleted: true };
  }
}
