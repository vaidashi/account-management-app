import { TransactionService } from './transaction.service';
import { TransactionRepository } from './transaction.repository';
import { Decimal } from '@prisma/client/runtime/library';
import { asAccountId, asMoney } from '../common/branded-types';

const decimal = (value: number) => new Decimal(value);
const makeAccount = (overrides?: Partial<{ balance: Decimal }>) => ({
  accountId: 1,
  personId: 1,
  balance: overrides?.balance ?? decimal(100),
  dailyWithdrawalLimit: decimal(300),
  activeFlag: true,
  accountType: 1,
  createDate: new Date('2026-02-01T00:00:00.000Z'),
});

describe('TransactionService', () => {
  const prismaService = {
    account: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  } as any;

  const repo = {
    createDeposit: jest.fn(),
    updateBalance: jest.fn(),
    createWithdrawal: jest.fn(),
    getWithdrawnTodayTotal: jest.fn(),
    getStatement: jest.fn(),
  } as unknown as jest.Mocked<TransactionRepository>;

  const service = new TransactionService(prismaService, repo);

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('deposits when account is active', async () => {
    prismaService.account.findUnique.mockResolvedValue({
      accountId: 1,
      activeFlag: true,
      balance: decimal(100),
    });
    repo.createDeposit.mockResolvedValue({
      accountId: 1,
      value: decimal(50),
      transactionDate: new Date('2026-02-01T00:00:00.000Z'),
      transactionId: 1,
    });
    repo.updateBalance.mockResolvedValue(
      makeAccount({ balance: decimal(150) }),
    );
    prismaService.$transaction.mockImplementation(async (fn: any) => fn());

    const result = await service.deposit({
      accountId: asAccountId(1),
      value: asMoney(50),
    });

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.value.newBalance).toBe(150);
    }
  });

  it('returns error when deposit account missing', async () => {
    prismaService.account.findUnique.mockResolvedValue(null);

    const result = await service.deposit({
      accountId: asAccountId(1),
      value: asMoney(50),
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.code).toBe('ACCOUNT_NOT_FOUND');
    }
  });

  it('returns error when account blocked', async () => {
    prismaService.account.findUnique.mockResolvedValue({
      accountId: 1,
      activeFlag: false,
      balance: decimal(100),
    });

    const result = await service.deposit({
      accountId: asAccountId(1),
      value: asMoney(50),
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.code).toBe('ACCOUNT_BLOCKED');
    }
  });

  it('withdraws within limits', async () => {
    prismaService.account.findUnique.mockResolvedValue({
      accountId: 1,
      activeFlag: true,
      balance: decimal(200),
      dailyWithdrawalLimit: decimal(300),
    });
    repo.getWithdrawnTodayTotal.mockResolvedValue(50);
    repo.createWithdrawal.mockResolvedValue({
      accountId: 1,
      value: decimal(-50),
      transactionDate: new Date('2026-02-01T00:00:00.000Z'),
      transactionId: 2,
    });
    repo.updateBalance.mockResolvedValue(
      makeAccount({ balance: decimal(150) }),
    );
    prismaService.$transaction.mockImplementation(async (fn: any) => fn());

    const result = await service.withdraw({
      accountId: asAccountId(1),
      value: asMoney(50),
    });

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.value.newBalance).toBe(150);
    }
  });

  it('returns error when insufficient funds', async () => {
    prismaService.account.findUnique.mockResolvedValue({
      accountId: 1,
      activeFlag: true,
      balance: decimal(40),
      dailyWithdrawalLimit: decimal(300),
    });

    const result = await service.withdraw({
      accountId: asAccountId(1),
      value: asMoney(50),
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.code).toBe('INSUFFICIENT_FUNDS');
    }
  });

  it('returns error when withdraw account missing', async () => {
    prismaService.account.findUnique.mockResolvedValue(null);

    const result = await service.withdraw({
      accountId: asAccountId(1),
      value: asMoney(50),
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.code).toBe('ACCOUNT_NOT_FOUND');
    }
  });

  it('returns error when withdraw account blocked', async () => {
    prismaService.account.findUnique.mockResolvedValue({
      accountId: 1,
      activeFlag: false,
      balance: decimal(200),
      dailyWithdrawalLimit: decimal(300),
    });

    const result = await service.withdraw({
      accountId: asAccountId(1),
      value: asMoney(50),
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.code).toBe('ACCOUNT_BLOCKED');
    }
  });

  it('returns error when daily limit exceeded', async () => {
    prismaService.account.findUnique.mockResolvedValue({
      accountId: 1,
      activeFlag: true,
      balance: decimal(500),
      dailyWithdrawalLimit: decimal(100),
    });
    repo.getWithdrawnTodayTotal.mockResolvedValue(90);

    const result = await service.withdraw({
      accountId: asAccountId(1),
      value: asMoney(20),
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.code).toBe('DAILY_LIMIT_EXCEEDED');
    }
  });

  it('returns error when statement account missing', async () => {
    prismaService.account.findUnique.mockResolvedValue(null);

    const result = await service.getStatement(
      { accountId: asAccountId(1) },
      20,
      0,
    );

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.code).toBe('ACCOUNT_NOT_FOUND');
    }
  });

  it('returns statements when account exists', async () => {
    prismaService.account.findUnique.mockResolvedValue({
      accountId: 1,
      activeFlag: true,
      balance: decimal(500),
      dailyWithdrawalLimit: decimal(100),
    });
    repo.getStatement.mockResolvedValue({
      total: 1,
      rows: [
        {
          transactionId: 1,
          accountId: 1,
          value: decimal(25),
          transactionDate: new Date('2026-02-02T00:00:00.000Z'),
        },
      ],
    });

    const result = await service.getStatement(
      { accountId: asAccountId(1) },
      20,
      0,
      new Date('2026-02-01T00:00:00.000Z'),
      new Date('2026-02-28T00:00:00.000Z'),
    );

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.value.total).toBe(1);
      expect(result.value.items).toHaveLength(1);
    }
  });
});
