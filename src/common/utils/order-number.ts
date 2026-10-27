import { Model } from 'mongoose';

export async function nextSequence(
  counterModel: Model<Record<string, unknown>>,
  businessId: string,
  key: string,
  prefix: string,
): Promise<string> {
  const doc = await counterModel
    .findOneAndUpdate(
      { businessId, key },
      { $inc: { value: 1 } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    )
    .lean()
    .exec();
  const value = (doc as { value?: number } | null)?.value ?? 1;
  return `${prefix}-${String(value).padStart(4, '0')}`;
}
