import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Expense, ExpenseDocument, EXPENSE_CATEGORIES, Recurrence } from './expense.schema';
import { CreateExpenseDto, ExpenseQueryDto, UpdateExpenseDto } from './dto/expense.dto';
import { sanitizeText, sanitizeUrl } from '../../common/utils/sanitize';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel(Expense.name) private readonly expenses: Model<ExpenseDocument>,
    private readonly audit: AuditService,
  ) {}

  categories() {
    return EXPENSE_CATEGORIES;
  }

  async create(userId: string, businessId: string, dto: CreateExpenseDto) {
    const date = new Date(dto.date);
    const recurrence = (dto.recurrence || 'none') as Recurrence;
    const expense = await this.expenses.create({
      businessId,
      category: dto.category,
      amountKobo: dto.amountKobo,
      date,
      notes: sanitizeText(dto.notes, 1000),
      receiptUrl: dto.receiptUrl ? sanitizeUrl(dto.receiptUrl) : null,
      recurrence,
      recurrenceEndsAt: dto.recurrenceEndsAt ? new Date(dto.recurrenceEndsAt) : null,
      nextOccurrenceAt: recurrence === 'none' ? null : this.nextDate(date, recurrence),
      createdBy: userId,
    });
    await this.audit.record({
      businessId,
      actorId: userId,
      action: 'expense.created',
      entity: 'expense',
      entityId: expense._id.toString(),
      metadata: { amountKobo: dto.amountKobo, category: dto.category },
    });
    return expense;
  }

  async list(businessId: string, query: ExpenseQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const filter: FilterQuery<ExpenseDocument> = { businessId };
    if (query.category && query.category !== 'all') filter.category = query.category;
    if (query.from || query.to) {
      filter.date = {
        ...(query.from ? { $gte: new Date(query.from) } : {}),
        ...(query.to ? { $lte: new Date(query.to) } : {}),
      };
    }
    if (query.search) filter.notes = new RegExp(query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const [items, total, grouped] = await Promise.all([
      this.expenses.find(filter).sort({ date: -1 }).skip((page - 1) * limit).limit(limit).lean().exec(),
      this.expenses.countDocuments(filter).exec(),
      this.expenses.aggregate([
        { $match: filter },
        { $group: { _id: '$category', total: { $sum: '$amountKobo' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } },
      ]).exec(),
    ]);
    const totalAmount = grouped.reduce((s: number, g: { total: number }) => s + g.total, 0);
    return {
      items,
      categories: EXPENSE_CATEGORIES,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        totalAmountKobo: totalAmount,
        byCategory: grouped.map((g: { _id: string; total: number; count: number }) => ({
          category: g._id,
          totalKobo: g.total,
          count: g.count,
        })),
      },
    };
  }

  async findOne(businessId: string, expenseId: string) {
    const expense = await this.expenses.findOne({ _id: expenseId, businessId }).lean().exec();
    if (!expense) throw new NotFoundException('Expense not found.');
    return expense;
  }

  async update(userId: string, businessId: string, expenseId: string, dto: UpdateExpenseDto) {
    const expense = await this.expenses.findOne({ _id: expenseId, businessId }).exec();
    if (!expense) throw new NotFoundException('Expense not found.');
    if (dto.category !== undefined) expense.category = dto.category as Expense['category'];
    if (dto.amountKobo !== undefined) expense.amountKobo = dto.amountKobo;
    if (dto.date !== undefined) expense.date = new Date(dto.date);
    if (dto.notes !== undefined) expense.notes = sanitizeText(dto.notes, 1000);
    if (dto.receiptUrl !== undefined) expense.receiptUrl = sanitizeUrl(dto.receiptUrl);
    if (dto.recurrence !== undefined) {
      expense.recurrence = dto.recurrence;
      expense.nextOccurrenceAt = dto.recurrence === 'none' ? null : this.nextDate(expense.date, dto.recurrence);
    }
    await expense.save();
    await this.audit.record({ businessId, actorId: userId, action: 'expense.updated', entity: 'expense', entityId: expenseId });
    return expense;
  }

  async remove(userId: string, businessId: string, expenseId: string) {
    const result = await this.expenses.deleteOne({ _id: expenseId, businessId }).exec();
    if (!result.deletedCount) throw new NotFoundException('Expense not found.');
    await this.audit.record({ businessId, actorId: userId, action: 'expense.deleted', entity: 'expense', entityId: expenseId });
    return { deleted: true };
  }

  async processRecurring(): Promise<{ created: number }> {
    let created = 0;
    const due = await this.expenses
      .find({ recurrence: { $ne: 'none' }, nextOccurrenceAt: { $lte: new Date() } })
      .limit(100)
      .exec();
    for (const parent of due) {
      const claimed = await this.expenses.findOneAndUpdate(
        { _id: parent._id, nextOccurrenceAt: parent.nextOccurrenceAt },
        { $set: { nextOccurrenceAt: this.nextDate(parent.nextOccurrenceAt!, parent.recurrence) } },
        { new: true },
      ).exec();
      if (!claimed) continue;
      if (claimed.recurrenceEndsAt && parent.nextOccurrenceAt! > claimed.recurrenceEndsAt) {
        await this.expenses.updateOne({ _id: parent._id }, { $set: { nextOccurrenceAt: null } }).exec();
        continue;
      }
      await this.expenses.create({
        businessId: parent.businessId,
        category: parent.category,
        amountKobo: parent.amountKobo,
        date: parent.nextOccurrenceAt,
        notes: parent.notes,
        receiptUrl: parent.receiptUrl,
        recurrence: 'none',
        recurringParentId: parent._id.toString(),
        createdBy: parent.createdBy,
        source: 'recurring',
      });
      created++;
    }
    return { created };
  }

  private nextDate(date: Date, recurrence: Recurrence): Date {
    const next = new Date(date);
    if (recurrence === 'daily') next.setDate(next.getDate() + 1);
    if (recurrence === 'weekly') next.setDate(next.getDate() + 7);
    if (recurrence === 'monthly') next.setMonth(next.getMonth() + 1);
    return next;
  }
}
