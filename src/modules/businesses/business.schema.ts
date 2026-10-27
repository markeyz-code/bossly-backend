import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { schemaOptions } from '../../common/schemas/schema-options';

export type BusinessDocument = HydratedDocument<Business>;

export interface SocialLinks {
  instagram?: string;
  twitter?: string;
  tiktok?: string;
  facebook?: string;
  website?: string;
}

export interface LookbookItem {
  url: string;
  caption?: string;
}

export interface SummarySettings {
  dailyEnabled: boolean;
  weeklyEnabled: boolean;
  sendTime: string;
  weeklyDay: number;
  channels: { whatsapp: boolean; email: boolean };
}

@Schema(schemaOptions('businesses'))
export class Business {
  createdAt: Date;
  updatedAt: Date;
  @Prop({ type: String, required: true, trim: true })
  name: string;

  @Prop({ type: String, required: true, unique: true, lowercase: true, index: true })
  slug: string;

  @Prop({ type: String, required: true, index: true })
  ownerId: string;

  @Prop({ type: String, default: 'other' })
  category: string;

  @Prop({ type: String, default: '' })
  description: string;

  @Prop({ type: String, default: '₦' })
  currency: string;

  @Prop({ type: String, default: 'Africa/Lagos' })
  timezone: string;

  @Prop({ type: String, default: null })
  logoUrl: string | null;

  @Prop({ type: String, default: null })
  bannerUrl: string | null;

  @Prop({ type: String, default: null })
  heroVideoUrl: string | null;

  @Prop({ type: String, default: null })
  storyImageUrl: string | null;

  @Prop({ type: String, default: 'The lookbook' })
  lookbookTitle: string;

  @Prop({ type: [Object], default: [] })
  lookbook: LookbookItem[];

  @Prop({ type: String, default: 'We sell the good stuff.' })
  tagline: string;

  @Prop({ type: String, default: '#FF5A1F' })
  brandColor: string;

  @Prop({ type: String, default: 'lagos-pop' })
  templateKey: string;

  @Prop({ type: [String], default: ['hero', 'featured', 'story', 'lookbook', 'categories', 'products', 'contact'] })
  sections: string[];

  @Prop({ type: Object, default: {} })
  socialLinks: SocialLinks;

  @Prop({ type: String, default: null })
  publicPhone: string | null;

  @Prop({ type: String, default: null })
  whatsappNumber: string | null;

  @Prop({ type: String, default: null })
  email: string | null;

  @Prop({ type: String, default: '' })
  address: string;

  @Prop({ type: String, default: '' })
  about: string;

  @Prop({ type: Boolean, default: false })
  storefrontPublished: boolean;

  @Prop({ type: Date, default: null })
  publishedAt: Date | null;

  @Prop({ type: String, default: '' })
  seoTitle: string;

  @Prop({ type: String, default: '' })
  seoDescription: string;

  @Prop({ type: String, default: null })
  customDomain: string | null;

  @Prop({ type: Boolean, default: false })
  customDomainVerified: boolean;

  @Prop({ type: String, default: null })
  embedKey: string | null;

  @Prop({
    type: Object,
    default: {
      dailyEnabled: true,
      weeklyEnabled: true,
      sendTime: '20:00',
      weeklyDay: 1,
      channels: { whatsapp: true, email: true },
    },
  })
  summarySettings: SummarySettings;

  @Prop({
    type: Object,
    default: {
      lowStockInApp: true,
      lowStockEmail: true,
      lowStockWhatsapp: true,
      debtReminders: true,
      reminderDaysBefore: 2,
      repeatOverdueEveryDays: 7,
    },
  })
  alertSettings: Record<string, unknown>;

  @Prop({ type: Number, default: 0 })
  onboardingStep: number;

  @Prop({ type: Boolean, default: false })
  isSuspended: boolean;

  @Prop({ type: Date, default: null })
  firstProductAt: Date | null;

  @Prop({ type: Date, default: null })
  firstSaleAt: Date | null;

  @Prop({ type: Date, default: null })
  firstProfitAt: Date | null;

  @Prop({ type: [String], default: [] })
  categories: string[];

  @Prop({ type: Date, default: null })
  lastDailySummaryAt: Date | null;

  @Prop({ type: Date, default: null })
  lastWeeklySummaryAt: Date | null;
}

export const BusinessSchema = SchemaFactory.createForClass(Business);
BusinessSchema.index({ createdAt: -1 });
BusinessSchema.index({ storefrontPublished: 1, slug: 1 });
BusinessSchema.index({ customDomain: 1 }, { sparse: true });
