import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { schemaOptions } from '../../common/schemas/schema-options';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ _id: true })
export class ProductVariant {
  _id?: Types.ObjectId;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  sku: string;

  @Prop({ type: Object, default: {} })
  attributes: Record<string, string>;

  @Prop({ type: Number, required: true, min: 0 })
  priceKobo: number;

  @Prop({ type: Number, required: true, min: 0 })
  costPriceKobo: number;

  @Prop({ type: Number, required: true, min: 0, default: 0 })
  quantity: number;

  @Prop({ type: Number, required: true, min: 0, default: 5 })
  lowStockThreshold: number;

  @Prop({ type: String, default: null })
  imageUrl: string | null;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Date, default: null })
  lastLowStockAlertAt: Date | null;

  @Prop({ type: Boolean, default: false })
  lowStockAlertActive: boolean;
}

export const ProductVariantSchema = SchemaFactory.createForClass(ProductVariant);

@Schema(schemaOptions('products'))
export class Product {
  createdAt: Date;
  updatedAt: Date;
  @Prop({ type: String, required: true, index: true })
  businessId: string;

  @Prop({ type: String, required: true, trim: true })
  name: string;

  @Prop({ type: String, default: '' })
  description: string;

  @Prop({ type: String, default: 'General', index: true })
  category: string;

  @Prop({ type: String, default: '' })
  sku: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: [ProductVariantSchema], default: [] })
  variants: ProductVariant[];

  @Prop({ type: Number, default: 0 })
  priceKobo: number;

  @Prop({ type: Number, default: 0 })
  costPriceKobo: number;

  @Prop({ type: Number, default: 0 })
  quantity: number;

  @Prop({ type: Number, default: 5 })
  lowStockThreshold: number;

  @Prop({ type: Boolean, default: true, index: true })
  isActive: boolean;

  @Prop({ type: Number, default: 0 })
  soldCount: number;

  @Prop({ type: Date, default: null })
  lastRestockedAt: Date | null;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({ businessId: 1, name: 1 });
ProductSchema.index({ businessId: 1, category: 1, isActive: 1 });
ProductSchema.index({ businessId: 1, quantity: 1 });
ProductSchema.index({ businessId: 1, sku: 1 }, { unique: true, partialFilterExpression: { sku: { $type: 'string', $ne: '' } } });
ProductSchema.index({ 'variants.sku': 1, businessId: 1 });
