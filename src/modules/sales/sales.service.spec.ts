import { SalesService } from './sales.service';

describe('sale profit allocation', () => {
  const service = new SalesService(
    {} as never, {} as never, {} as never, {} as never, {} as never, {} as never,
    {} as never, {} as never, {} as never, {} as never, {} as never, {} as never,
  );
  const lines = [
    { productId: 'p1', variantId: 'v1', productName: 'Hoodie', variantName: 'M', sku: 'H-M', quantity: 2, unitPriceKobo: 50000, unitCostKobo: 30000 },
    { productId: 'p2', variantId: 'v2', productName: 'Cap', variantName: 'One', sku: 'C-1', quantity: 1, unitPriceKobo: 20000, unitCostKobo: 8000 },
  ];

  it('allocates a total discount across lines without losing kobo', () => {
    const items = (service as unknown as { allocateDiscount: (l: typeof lines, d: number) => Array<{ lineTotalKobo: number; discountKobo: number }> }).allocateDiscount(lines, 12000);
    expect(items.reduce((sum, i) => sum + i.lineTotalKobo, 0)).toBe(108000);
    expect(items.reduce((sum, i) => sum + i.discountKobo, 0)).toBe(12000);
    expect(items[0].lineTotalKobo).toBe(90000);
    expect(items[1].lineTotalKobo).toBe(18000);
  });

  it('never discounts more than gross value', () => {
    const items = (service as unknown as { allocateDiscount: (l: typeof lines, d: number) => Array<{ lineTotalKobo: number }> }).allocateDiscount(lines, 999999);
    expect(items.every((i) => i.lineTotalKobo >= 0)).toBe(true);
    expect(items.reduce((sum, i) => sum + i.lineTotalKobo, 0)).toBe(0);
  });
});
