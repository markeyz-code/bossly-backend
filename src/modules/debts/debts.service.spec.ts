import { DebtsService } from './debts.service';

describe('debt calculations', () => {
  const service = new DebtsService(
    {} as never, {} as never, {} as never, {} as never, {} as never, {} as never, {} as never,
  );

  it('marks a fully settled debt as paid even after the due date', () => {
    expect(service.statusFor(0, 10000, new Date(Date.now() - 86400000))).toBe('paid');
  });

  it('marks an unpaid past-due debt as overdue', () => {
    expect(service.statusFor(5000, 0, new Date(Date.now() - 86400000))).toBe('overdue');
  });

  it('marks a part-paid future debt as partial', () => {
    expect(service.statusFor(5000, 5000, new Date(Date.now() + 86400000))).toBe('partial');
  });

  it('marks a fully unpaid future debt as unpaid', () => {
    expect(service.statusFor(10000, 0, new Date(Date.now() + 86400000))).toBe('unpaid');
  });
});
