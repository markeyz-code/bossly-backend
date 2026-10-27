import { endOfDay, endOfMonth, endOfWeek, startOfDay, startOfMonth, startOfWeek, subDays, subMonths, subWeeks } from 'date-fns';
import { formatInTimeZone, fromZonedTime, toZonedTime } from 'date-fns-tz';

export const LAGOS_TZ = 'Africa/Lagos';

export function lagosNow(): Date {
  return toZonedTime(new Date(), LAGOS_TZ);
}

export function lagosStartOfDay(date: Date = new Date()): Date {
  const zoned = toZonedTime(date, LAGOS_TZ);
  return fromZonedTime(startOfDay(zoned), LAGOS_TZ);
}

export function lagosEndOfDay(date: Date = new Date()): Date {
  const zoned = toZonedTime(date, LAGOS_TZ);
  return fromZonedTime(endOfDay(zoned), LAGOS_TZ);
}

export function lagosDayKey(date: Date = new Date()): string {
  return formatInTimeZone(date, LAGOS_TZ, 'yyyy-MM-dd');
}

export function lagosDisplay(date: Date | string, fmt = 'd MMM, h:mm a'): string {
  return formatInTimeZone(new Date(date), LAGOS_TZ, fmt);
}

export type DateRangePreset = 'today' | 'week' | 'month' | 'custom' | 'last_month';

export function resolveDateRange(
  preset: DateRangePreset = 'month',
  from?: string,
  to?: string,
): { from: Date; to: Date; previousFrom: Date; previousTo: Date; label: string } {
  const now = new Date();
  let start: Date;
  let end: Date = now;
  let previousFrom: Date;
  let previousTo: Date;
  let label: string;

  switch (preset) {
    case 'today':
      start = lagosStartOfDay(now);
      end = lagosEndOfDay(now);
      previousFrom = lagosStartOfDay(subDays(now, 1));
      previousTo = lagosEndOfDay(subDays(now, 1));
      label = 'today';
      break;
    case 'week': {
      const zoned = toZonedTime(now, LAGOS_TZ);
      start = fromZonedTime(startOfWeek(zoned, { weekStartsOn: 1 }), LAGOS_TZ);
      end = fromZonedTime(endOfWeek(zoned, { weekStartsOn: 1 }), LAGOS_TZ);
      previousFrom = lagosStartOfDay(subWeeks(now, 1));
      previousTo = lagosEndOfDay(subDays(lagosStartOfDay(now), 1));
      label = 'this week';
      break;
    }
    case 'last_month': {
      const zoned = toZonedTime(now, LAGOS_TZ);
      const lastMonth = subMonths(zoned, 1);
      start = fromZonedTime(startOfMonth(lastMonth), LAGOS_TZ);
      end = fromZonedTime(endOfMonth(lastMonth), LAGOS_TZ);
      previousFrom = fromZonedTime(startOfMonth(subMonths(zoned, 2)), LAGOS_TZ);
      previousTo = fromZonedTime(endOfMonth(subMonths(zoned, 2)), LAGOS_TZ);
      label = 'last month';
      break;
    }
    case 'custom':
      start = from ? lagosStartOfDay(new Date(from)) : lagosStartOfDay(subDays(now, 30));
      end = to ? lagosEndOfDay(new Date(to)) : lagosEndOfDay(now);
      previousFrom = new Date(start.getTime() - (end.getTime() - start.getTime()));
      previousTo = new Date(start.getTime() - 1);
      label = 'selected period';
      break;
    case 'month':
    default: {
      const zoned = toZonedTime(now, LAGOS_TZ);
      start = fromZonedTime(startOfMonth(zoned), LAGOS_TZ);
      end = fromZonedTime(endOfMonth(zoned), LAGOS_TZ);
      previousFrom = fromZonedTime(startOfMonth(subMonths(zoned, 1)), LAGOS_TZ);
      previousTo = fromZonedTime(endOfMonth(subMonths(zoned, 1)), LAGOS_TZ);
      label = 'this month';
      break;
    }
  }
  return { from: start, to: end, previousFrom, previousTo, label };
}

export function humanRangeLabel(range: { from: Date; to: Date }): string {
  return `${formatInTimeZone(range.from, LAGOS_TZ, 'd MMM')} – ${formatInTimeZone(range.to, LAGOS_TZ, 'd MMM yyyy')}`;
}
