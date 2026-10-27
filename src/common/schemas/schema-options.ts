import type { SchemaOptions } from 'mongoose';

export function schemaOptions(collection?: string): SchemaOptions {
  return {
    timestamps: true,
    ...(collection ? { collection } : {}),
    toJSON: {
      virtuals: true,
      transform: (_doc: unknown, ret: Record<string, unknown>) => {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  };
}
