import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import { Connection, Model } from 'mongoose';
import { Affiliate, AffiliateDocument } from './affiliate.schema';
import { Referral, ReferralDocument } from './referral.schema';
import { AffiliatePayout, AffiliatePayoutDocument } from './affiliate-payout.schema';
import { Business, BusinessDocument } from '../businesses/business.schema';
import { AuditService } from '../audit/audit.service';
import { randomToken } from '../../common/utils/tokens';
import { AdminPayoutQueryDto, AdminUpdatePayoutDto, RequestAffiliatePayoutDto, UpdateAffiliateDetailsDto } from './dto/affiliate.dto';

const HOLD_DAYS = 7;
const COMMISSION_RATE = 20;
const MIN_PAYOUT_KOBO = 100000;

@Injectable()
export class AffiliatesService {
  private readonly logger = new Logger(AffiliatesService.name);

  constructor(
    @InjectModel(Affiliate.name) private readonly affiliates: Model<AffiliateDocument>,
    @InjectModel(Referral.name) private readonly referrals: Model<ReferralDocument>,
    @InjectModel(AffiliatePayout.name) private readonly payouts: Model<AffiliatePayoutDocument>,
    @InjectModel(Business.name) private readonly businesses: Model<BusinessDocument>,
    @InjectConnection() private readonly connection: Connection,
    private readonly audit: AuditService,
    private readonly config: ConfigService,
  ) {}

  async ensureAffiliate(businessId: string): Promise<AffiliateDocument> {
    const existing = await this.affiliates.findOne({ businessId }).exec();
    if (existing) return existing;
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = `BOS${randomToken(4).toUpperCase()}`;
      try {
        return await this.affiliates.create({ businessId, code, commissionRate: COMMISSION_RATE });
      } catch (error) {
        if ((error as { code?: number }).code !== 11000) throw error;
        const raced = await this.affiliates.findOne({ businessId }).exec();
        if (raced) return raced;
      }
    }
    throw new ConflictException('Could not create a referral code. Please try again.');
  }

  async overview(businessId: string) {
    const affiliate = await this.ensureAffiliate(businessId);
    const [referrals, payouts] = await Promise.all([
      this.referrals.find({ referrerBusinessId: businessId }).sort({ createdAt: -1 }).limit(100).lean().exec(),
      this.payouts.find({ businessId }).sort({ createdAt: -1 }).limit(20).lean().exec(),
    ]);
    const referredIds = referrals.filter((r) => r.status === 'converted').map((r) => r.referredBusinessId);
    const referred = await this.businesses.find({ _id: { $in: referredIds } }).select('name slug').lean().exec();
    return {
      code: affiliate.code,
      link: `${this.config.get('appUrl')}/register?ref=${affiliate.code}`,
      commissionRate: affiliate.commissionRate,
      holdDays: HOLD_DAYS,
      minimumPayoutKobo: MIN_PAYOUT_KOBO,
      stats: {
        referralCount: affiliate.referralCount,
        convertedCount: affiliate.convertedCount,
        totalEarnedKobo: affiliate.totalEarnedKobo,
        pendingKobo: affiliate.pendingKobo,
        availableKobo: affiliate.availableKobo,
        payoutPendingKobo: affiliate.payoutPendingKobo,
        paidKobo: affiliate.paidKobo,
      },
      payoutDetails: {
        bankName: affiliate.payoutBankName,
        accountName: affiliate.payoutAccountName,
        accountNumber: affiliate.payoutAccountNumber,
      },
      referrals: referrals.map((r) => ({
        id: r._id.toString(),
        business:
          r.status === 'converted'
            ? referred.find((b) => String(b._id) === r.referredBusinessId)?.name || r.referredBusinessName
            : 'New signup',
        status: r.status,
        commissionKobo: r.commissionKobo,
        commissionStatus: r.commissionStatus,
        commissionAvailableAt: r.commissionAvailableAt,
        convertedAt: r.convertedAt,
        createdAt: r.createdAt,
      })),
      payouts,
    };
  }

  async updateDetails(businessId: string, dto: UpdateAffiliateDetailsDto) {
    const affiliate = await this.ensureAffiliate(businessId);
    affiliate.payoutBankName = dto.bankName;
    affiliate.payoutAccountName = dto.accountName;
    affiliate.payoutAccountNumber = dto.accountNumber;
    await affiliate.save();
    return {
      bankName: affiliate.payoutBankName,
      accountName: affiliate.payoutAccountName,
      accountNumber: affiliate.payoutAccountNumber,
    };
  }

  async requestPayout(actorId: string, businessId: string, dto: RequestAffiliatePayoutDto) {
    if (dto.amountKobo < MIN_PAYOUT_KOBO) throw new BadRequestException('The minimum payout is ₦1,000.');
    await this.ensureAffiliate(businessId);
    const session = await this.connection.startSession();
    let payout!: AffiliatePayoutDocument;
    let availableKobo = 0;
    try {
      await session.withTransaction(async () => {
        const claimed = await this.affiliates.findOneAndUpdate(
          { businessId, availableKobo: { $gte: dto.amountKobo } },
          {
            $inc: { availableKobo: -dto.amountKobo, payoutPendingKobo: dto.amountKobo },
            $set: { payoutBankName: dto.bankName, payoutAccountName: dto.accountName, payoutAccountNumber: dto.accountNumber },
          },
          { new: true, session },
        ).exec();
        if (!claimed) throw new BadRequestException('You do not have that much available yet. Refresh and try again.');
        availableKobo = claimed.availableKobo;
        const created = await this.payouts.create(
          [{
            businessId,
            amountKobo: dto.amountKobo,
            status: 'requested',
            bankName: dto.bankName,
            accountName: dto.accountName,
            accountNumber: dto.accountNumber,
          }],
          { session },
        );
        payout = created[0];
      });
    } finally {
      await session.endSession();
    }
    await this.audit.record({
      businessId,
      actorId,
      action: 'affiliate.payout_requested',
      entity: 'affiliate_payout',
      entityId: payout._id.toString(),
      metadata: { amountKobo: dto.amountKobo },
    });
    return { payout: payout.toObject(), availableKobo };
  }

  /**
   * Attribute a new business to a referrer. Never throws: a bad/expired code
   * must not prevent someone from signing up.
   */
  async attributeRegistration(code: string | undefined, referredBusinessId: string, referredBusinessName: string) {
    if (!code) return { attributed: false };
    try {
      const affiliate = await this.affiliates.findOne({ code: code.trim().toUpperCase() }).lean().exec();
      if (!affiliate || affiliate.businessId === referredBusinessId) return { attributed: false };
      const exists = await this.referrals.exists({ referredBusinessId });
      if (exists) return { attributed: false };
      await this.referrals.create({
        referrerBusinessId: affiliate.businessId,
        code: affiliate.code,
        referredBusinessId,
        referredBusinessName,
        commissionRate: affiliate.commissionRate,
      });
      await this.affiliates.updateOne({ _id: affiliate._id }, { $inc: { referralCount: 1 } }).exec();
      return { attributed: true };
    } catch (error) {
      this.logger.warn(`Referral attribution failed: ${error instanceof Error ? error.message : 'unknown'}`);
      return { attributed: false };
    }
  }

  /** Called only after a successful, local subscription payment. One commission per business. */
  async recordSubscriptionPayment(businessId: string, amountKobo: number): Promise<void> {
    if (amountKobo <= 0) return;
    const referral = await this.referrals.findOne({ referredBusinessId: businessId, status: 'registered' }).exec();
    if (!referral) return;
    const commissionKobo = Math.max(0, Math.round((amountKobo * referral.commissionRate) / 100));
    const availableAt = new Date(Date.now() + HOLD_DAYS * 86400000);
    const claimed = await this.referrals.findOneAndUpdate(
      { _id: referral._id, status: 'registered' },
      {
        $set: {
          status: 'converted',
          commissionKobo,
          commissionStatus: 'pending',
          commissionAvailableAt: availableAt,
          convertedAt: new Date(),
        },
      },
      { new: true },
    ).exec();
    if (!claimed) return;
    await this.affiliates.updateOne(
      { businessId: referral.referrerBusinessId },
      {
        $inc: {
          convertedCount: 1,
          totalEarnedKobo: commissionKobo,
          pendingKobo: commissionKobo,
        },
      },
    ).exec();
  }

  @Cron('10 1 * * *', { timeZone: 'Africa/Lagos', name: 'affiliate-commission-release' })
  async releaseCommissions(): Promise<void> {
    try {
      const due = await this.referrals.find({
        status: 'converted',
        commissionStatus: 'pending',
        commissionAvailableAt: { $lte: new Date() },
      }).limit(1000).exec();
      for (const referral of due) {
        const claimed = await this.referrals.findOneAndUpdate(
          { _id: referral._id, commissionStatus: 'pending' },
          { $set: { commissionStatus: 'available', commissionReleasedAt: new Date() } },
          { new: true },
        ).exec();
        if (!claimed) continue;
        await this.affiliates.updateOne(
          { businessId: referral.referrerBusinessId },
          { $inc: { pendingKobo: -referral.commissionKobo, availableKobo: referral.commissionKobo } },
        ).exec();
      }
    } catch (error) {
      this.logger.error(`Commission release failed: ${error instanceof Error ? error.message : 'unknown'}`);
    }
  }

  async adminOverview() {
    const [aggregate, topRows, pending] = await Promise.all([
      this.affiliates.aggregate([
        {
          $group: {
            _id: null,
            affiliates: { $sum: 1 },
            referrals: { $sum: '$referralCount' },
            conversions: { $sum: '$convertedCount' },
            totalEarnedKobo: { $sum: '$totalEarnedKobo' },
            pendingKobo: { $sum: '$pendingKobo' },
            availableKobo: { $sum: '$availableKobo' },
            paidKobo: { $sum: '$paidKobo' },
          },
        },
      ]).exec(),
      this.affiliates.find({}).sort({ totalEarnedKobo: -1 }).limit(10).lean().exec(),
      this.payouts.countDocuments({ status: 'requested' }).exec(),
    ]);
    const businessIds = topRows.map((a) => a.businessId);
    const businesses = await this.businesses.find({ _id: { $in: businessIds } }).select('name slug').lean().exec();
    return {
      metrics: {
        affiliates: aggregate[0]?.affiliates || 0,
        referrals: aggregate[0]?.referrals || 0,
        conversions: aggregate[0]?.conversions || 0,
        totalEarnedKobo: aggregate[0]?.totalEarnedKobo || 0,
        pendingKobo: aggregate[0]?.pendingKobo || 0,
        availableKobo: aggregate[0]?.availableKobo || 0,
        paidKobo: aggregate[0]?.paidKobo || 0,
        pendingPayouts: pending,
      },
      topAffiliates: topRows.map((a) => ({
        businessId: a.businessId,
        name: businesses.find((b) => String(b._id) === a.businessId)?.name || 'Unknown business',
        slug: businesses.find((b) => String(b._id) === a.businessId)?.slug || '',
        code: a.code,
        referrals: a.referralCount,
        conversions: a.convertedCount,
        earnedKobo: a.totalEarnedKobo,
        availableKobo: a.availableKobo,
      })),
    };
  }

  async adminListPayouts(query: AdminPayoutQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 30;
    const filter: Record<string, unknown> = {};
    if (query.status && query.status !== 'all') filter.status = query.status;
    if (query.search) {
      const rx = new RegExp(query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ accountName: rx }, { accountNumber: rx }, { bankName: rx }, { reference: rx }];
    }
    const [items, total] = await Promise.all([
      this.payouts.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean().exec(),
      this.payouts.countDocuments(filter).exec(),
    ]);
    const businesses = await this.businesses.find({ _id: { $in: items.map((p) => p.businessId) } }).select('name slug').lean().exec();
    return {
      items: items.map((p) => ({
        ...p,
        business: businesses.find((b) => String(b._id) === p.businessId) || null,
      })),
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }

  async adminUpdatePayout(actorId: string, payoutId: string, dto: AdminUpdatePayoutDto) {
    const session = await this.connection.startSession();
    let updated!: AffiliatePayoutDocument;
    try {
      await session.withTransaction(async () => {
        const payout = await this.payouts.findOneAndUpdate(
          { _id: payoutId, status: 'requested' },
          {
            $set: {
              status: dto.status,
              note: dto.note || null,
              reference: dto.reference || null,
              processedAt: new Date(),
              processedBy: actorId,
            },
          },
          { new: true, session },
        ).exec();
        if (!payout) {
          const exists = await this.payouts.exists({ _id: payoutId }).session(session);
          throw exists
            ? new ConflictException('This payout has already been processed.')
            : new NotFoundException('Payout request not found.');
        }
        updated = payout;
        await this.affiliates.updateOne(
          { businessId: payout.businessId },
          dto.status === 'paid'
            ? { $inc: { payoutPendingKobo: -payout.amountKobo, paidKobo: payout.amountKobo } }
            : { $inc: { payoutPendingKobo: -payout.amountKobo, availableKobo: payout.amountKobo } },
          { session },
        ).exec();
      });
    } finally {
      await session.endSession();
    }
    await this.audit.record({
      businessId: updated.businessId,
      actorId,
      actorType: 'platform_admin',
      action: dto.status === 'paid' ? 'affiliate.payout_paid' : 'affiliate.payout_rejected',
      entity: 'affiliate_payout',
      entityId: payoutId,
      metadata: { amountKobo: updated.amountKobo, reference: dto.reference, note: dto.note },
    });
    return { updated: true, status: updated.status };
  }

  async exportPayouts(): Promise<Array<Record<string, unknown>>> {
    const payouts = await this.payouts.find({}).sort({ createdAt: -1 }).limit(5000).lean().exec();
    const businesses = await this.businesses.find({ _id: { $in: payouts.map((p) => p.businessId) } }).select('name slug').lean().exec();
    return payouts.map((p) => ({
      requestedAt: p.createdAt,
      business: businesses.find((b) => String(b._id) === p.businessId)?.name || p.businessId,
      slug: businesses.find((b) => String(b._id) === p.businessId)?.slug || '',
      amountNaira: p.amountKobo / 100,
      status: p.status,
      bankName: p.bankName,
      accountName: p.accountName,
      accountNumber: p.accountNumber,
      reference: p.reference || '',
      note: p.note || '',
      processedAt: p.processedAt,
    }));
  }

  async exportAffiliates(): Promise<Array<Record<string, unknown>>> {
    const affiliates = await this.affiliates.find({}).sort({ totalEarnedKobo: -1 }).limit(5000).lean().exec();
    const businesses = await this.businesses.find({ _id: { $in: affiliates.map((a) => a.businessId) } }).select('name slug').lean().exec();
    return affiliates.map((a) => ({
      business: businesses.find((b) => String(b._id) === a.businessId)?.name || a.businessId,
      slug: businesses.find((b) => String(b._id) === a.businessId)?.slug || '',
      code: a.code,
      referrals: a.referralCount,
      conversions: a.convertedCount,
      totalEarnedNaira: a.totalEarnedKobo / 100,
      pendingNaira: a.pendingKobo / 100,
      availableNaira: a.availableKobo / 100,
      paidNaira: a.paidKobo / 100,
    }));
  }
}
