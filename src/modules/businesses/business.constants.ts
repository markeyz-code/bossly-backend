export const BUSINESS_CATEGORIES = [
  { key: 'fashion', label: 'Fashion & thrift' },
  { key: 'food', label: 'Food & drinks' },
  { key: 'beauty', label: 'Beauty & skincare' },
  { key: 'gadgets', label: 'Gadgets & accessories' },
  { key: 'books', label: 'Books & stationery' },
  { key: 'services', label: 'Services & skills' },
  { key: 'hair', label: 'Hair & barbing' },
  { key: 'art', label: 'Art & crafts' },
  { key: 'other', label: 'Something else' },
] as const;

export const BUSINESS_CATEGORY_KEYS = BUSINESS_CATEGORIES.map((c) => c.key);
