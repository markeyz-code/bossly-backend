import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { schemaOptions } from '../../common/schemas/schema-options';

export type StockMovementDocument = HydratedDocument<StockMovement>;
export type StockMovementType = 'sale' | 'restock' | 'adjustment' | 'return' | 'cancellation' | 'initial';

@Schema(schemaOptions('stock_movements'))
export class StockMovement {
  @Prop({ type: String, required: true, index: true })
  businessId: string;

  @Prop({ type: String, required: true, index: true })
  productId: string;

  @Prop({ type: String, default: null })
  variantId: string | null;

  @Prop({ type: String, required: true })
  productName: string;

  @Prop({ type: String, default: '' })
  variantName: string;

  @Prop({ type: String, enum: ['sale', 'restock', 'adjustment', 'return', 'cancellation', 'initial'], required: true })
  type: StockMovementType;

  @Prop({ type: Number, required: true })
  quantityDelta: number;

  @Prop({ type: Number, required: true })
  quantityBefore: number;

  @Prop({ type: Number, required: true })
  quantityAfter: number;

  @Prop({ type: Number, default: null })
  unitCostKobo: number | null;

  @Prop({ type: String, default: null })
  reference: string | null;

  @Prop({ type: String, default: null })
  referenceType: string | null;

  @Prop({ type: String, default: null })
  referenceId: string | null;

  @Prop({ type: String, default: '' })
  note: string;

  @Prop({ type: String, default: null })
  userId: string | null;
}

export const StockMovementSchema = SchemaFactory.createForClass(StockMovement);
StockMovementSchema.index({ businessId: 1, createdAt: -1 });
StockMovementSchema.index({ businessId: 1, productId: 1, createdAt: -1 });
StockMovementSchema.index({ businessId: 1, type: 1, createdAt: -1 });
