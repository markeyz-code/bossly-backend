import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { schemaOptions } from '../../common/schemas/schema-options';

export type CounterDocument = HydratedDocument<Counter>;

@Schema(schemaOptions('counters'))
export class Counter {
  @Prop({ type: String, required: true })
  businessId: string;

  @Prop({ type: String, required: true })
  key: string;

  @Prop({ type: Number, default: 0 })
  value: number;
}

export const CounterSchema = SchemaFactory.createForClass(Counter);
CounterSchema.index({ businessId: 1, key: 1 }, { unique: true });
