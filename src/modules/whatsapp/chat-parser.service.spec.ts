import { ChatParserService } from './chat-parser.service';

const catalog = [
  {
    _id: { toString: () => 'p1' }, name: 'Oversized Campus Hoodie', description: '', category: 'Hoodies', sku: 'HOOD',
    images: [], tags: [], priceKobo: 1250000, costPriceKobo: 700000, quantity: 10, lowStockThreshold: 2,
    isActive: true, soldCount: 0, variants: [
      { _id: { toString: () => 'v1' }, name: 'Black / M', sku: 'HOOD-BLK-M', attributes: { colour: 'Black', size: 'M' }, priceKobo: 1250000, costPriceKobo: 700000, quantity: 5, lowStockThreshold: 2, isActive: true },
      { _id: { toString: () => 'v2' }, name: 'Black / L', sku: 'HOOD-BLK-L', attributes: { colour: 'Black', size: 'L' }, priceKobo: 1250000, costPriceKobo: 700000, quantity: 5, lowStockThreshold: 2, isActive: true },
    ],
  },
  {
    _id: { toString: () => 'p2' }, name: 'Vintage Wash Cap', description: '', category: 'Accessories', sku: 'CAP',
    images: [], tags: [], priceKobo: 450000, costPriceKobo: 200000, quantity: 20, lowStockThreshold: 5,
    isActive: true, soldCount: 0, variants: [
      { _id: { toString: () => 'v3' }, name: 'Standard', sku: 'CAP-1', attributes: {}, priceKobo: 450000, costPriceKobo: 200000, quantity: 20, lowStockThreshold: 5, isActive: true },
    ],
  },
];

function makeParser(llmResult: unknown = null) {
  const productModel = { find: () => ({ lean: () => ({ exec: async () => catalog }) }) };
  const llm = {
    isConfigured: llmResult !== null,
    parseChat: jest.fn(async () => llmResult),
  };
  return { parser: new ChatParserService(productModel as never, llm as never), llm };
}

describe('WhatsApp / paste-chat parser', () => {
  it('extracts customer, phone, delivery, quantities and catalogue matches', async () => {
    const { parser } = makeParser();
    const draft = await parser.parse('biz-1', 'Hi, I want 2 black hoodies and 1 cap. My name is Tola Bakare, phone 08122334455. Deliver to 12 Adisa Street, Yaba.');
    expect(draft.customerName).toBe('Tola Bakare');
    expect(draft.customerPhone).toBe('2348122334455');
    expect(draft.deliveryAddress).toContain('12 Adisa Street');
    expect(draft.items).toHaveLength(2);
    const hoodie = draft.items.find((i) => i.name.includes('Hoodie'));
    const cap = draft.items.find((i) => i.name.includes('Cap'));
    expect(hoodie?.quantity).toBe(2);
    expect(cap?.quantity).toBe(1);
    expect(draft.totals.totalKobo).toBe(2950000);
    expect(draft.warnings.length).toBeGreaterThanOrEqual(0);
  });

  it('flags an item that is not in the catalogue', async () => {
    const { parser } = makeParser();
    const draft = await parser.parse('biz-1', 'Please send 2 bum shorts and 1 cap. Name: Chika, 08099990123.');
    expect(draft.items.some((i) => i.name.includes('Cap'))).toBe(true);
    expect(draft.unmatched.length).toBeGreaterThanOrEqual(1);
    expect(draft.unmatched[0].phrase).toContain('bum shorts');
  });

  it('falls back to the LLM parser for messy text when configured', async () => {
    const { parser, llm } = makeParser({
      customerName: 'Amaka', customerPhone: '08033445566', address: 'Akoka', confidence: 0.8,
      items: [{ phrase: 'campus hoodie', quantity: 1, unitPriceKobo: 1200000 }], amountPaidKobo: null, amountOwedKobo: null, notes: '',
    });
    const draft = await parser.parse('biz-1', 'abeg make e be the item wey I talked about, one piece. I go send location');
    expect(llm.parseChat).toHaveBeenCalled();
    expect(draft.parserUsed).toBe('llm');
    expect(draft.items[0].name).toBe('Oversized Campus Hoodie');
    expect(draft.customerPhone).toBe('2348033445566');
  });

  it('matches totals and applies quoted unit prices as a discount', async () => {
    const { parser } = makeParser();
    const draft = await parser.parse('biz-1', 'I want 2 hoodies for 10,000 each. Phone 08122334455.');
    const line = draft.items[0];
    expect(line.quotedUnitPriceKobo).toBe(1000000);
    expect(draft.totals.subtotalKobo).toBe(2500000);
    expect(draft.totals.discountKobo).toBe(500000);
    expect(draft.totals.totalKobo).toBe(2000000);
  });
});
