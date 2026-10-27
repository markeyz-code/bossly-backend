import slugify from 'slugify';

export function makeSlug(input: string): string {
  return slugify(input || 'business', { lower: true, strict: true, trim: true }).slice(0, 50) || 'business';
}

export function uniqueSuffix(): string {
  return Math.random().toString(36).slice(2, 7);
}
