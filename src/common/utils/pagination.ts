import { FilterQuery, Model } from 'mongoose';

export async function paginateModel<T>(
  model: Model<T>,
  filter: FilterQuery<T>,
  opts: { page: number; limit: number; sort?: Record<string, 1 | -1> },
): Promise<{ items: T[]; total: number; page: number; limit: number; pages: number; hasNext: boolean }> {
  const page = Math.max(1, opts.page || 1);
  const limit = Math.min(100, Math.max(1, opts.limit || 20));
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    model.find(filter).sort(opts.sort || { createdAt: -1 }).skip(skip).limit(limit).lean().exec(),
    model.countDocuments(filter).exec(),
  ]);
  const pages = Math.ceil(total / limit);
  return { items: items as T[], total, page, limit, pages, hasNext: page < pages };
}
