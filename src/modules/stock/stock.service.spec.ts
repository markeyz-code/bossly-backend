import { ConflictException } from '@nestjs/common';
import { StockService } from './stock.service';

function product() {
  return {
    _id: { toString: () => 'product-1' },
    name: 'Campus Hoodie',
    isActive: true,
    variants: [
      { _id: { toString: () => 'variant-1' }, name: 'Black / M', sku: 'HOOD-M', priceKobo: 1250000, costPriceKobo: 700000, quantity: 5, isActive: true },
    ],
  };
}

function setup(quantity = 5) {
  const p = product();
  p.variants[0].quantity = quantity;
  const findOne = jest.fn(() => ({ session: () => ({ exec: async () => p }) }));
  const findOneAndUpdate = jest.fn(() => ({ exec: async () => p }));
  const create = jest.fn(async () => [{}]);
  const alerts = { checkMany: jest.fn() };
  const service = new StockService(
    { findOne, findOneAndUpdate } as never,
    { create } as never,
    {} as never,
    alerts as never,
  );
  return { service, findOneAndUpdate, create, alerts, product: p };
}

const session = {} as never;

describe('stock ledger', () => {
  it('deducts stock atomically and writes a traceable sale movement', async () => {
    const ctx = setup(5);
    const result = await ctx.service.deductLines(session, 'biz-1', [{ productId: 'product-1', variantId: 'variant-1', quantity: 2 }], 'SALE-0001', 'sale', 'sale-1', 'user-1');
    expect(ctx.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ 'variants.quantity': { $gte: 2 } }),
      expect.objectContaining({ $inc: expect.objectContaining({ 'variants.$.quantity': -2, quantity: -2 }) }),
      expect.objectContaining({ session }),
    );
    expect(ctx.create).toHaveBeenCalledWith(
      [expect.objectContaining({ type: 'sale', quantityBefore: 5, quantityAfter: 3, quantityDelta: -2, reference: 'SALE-0001' })],
      { session },
    );
    expect(result.lines[0]).toMatchObject({ productId: 'product-1', variantId: 'variant-1', unitCostKobo: 700000 });
    expect(result.lowStock[0]).toEqual({ productId: 'product-1', variantId: 'variant-1' });
  });

  it('refuses to oversell stock', async () => {
    const ctx = setup(1);
    await expect(ctx.service.deductLines(session, 'biz-1', [{ productId: 'product-1', variantId: 'variant-1', quantity: 3 }], 'SALE-0002', 'sale', 'sale-2')).rejects.toBeInstanceOf(ConflictException);
    expect(ctx.create).not.toHaveBeenCalled();
  });

  it('records opening stock without changing quantities', async () => {
    const ctx = setup(5);
    const movements: unknown[] = [];
    const svc = new StockService(
      {} as never,
      { insertMany: jest.fn(async (docs: unknown[]) => { movements.push(...docs); }) } as never,
      {} as never,
      { checkMany: jest.fn() } as never,
    );
    const refs = await svc.recordInitial('biz-1', ctx.product as never, 'user-1');
    expect(movements).toHaveLength(1);
    expect(movements[0]).toMatchObject({ type: 'initial', quantityBefore: 0, quantityAfter: 5, quantityDelta: 5 });
    expect(refs).toEqual([{ productId: 'product-1', variantId: 'variant-1' }]);
  });
});
