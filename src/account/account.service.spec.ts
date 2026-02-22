import { AccountService } from './account.service';
import { AccountRepository } from './account.repository';
import { AccountRecord } from './types';
import { asAccountId, asPersonId } from '../common/branded-types';

describe('AccountService', () => {
  const repo = {
    personExists: jest.fn(),
    createAccount: jest.fn(),
    getAccountById: jest.fn(),
    blockAccount: jest.fn(),
  } as unknown as jest.Mocked<AccountRepository>;

  const service = new AccountService(repo);

  const account: AccountRecord = {
    accountId: asAccountId(1),
    personId: asPersonId(1),
    balance: 0,
    dailyWithdrawalLimit: 1000,
    activeFlag: true,
    accountType: 1,
    createDate: new Date('2026-02-01T00:00:00.000Z'),
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('creates account when person exists', async () => {
    repo.personExists.mockResolvedValue(true);
    repo.createAccount.mockResolvedValue(account);

    const result = await service.createAccount({
      personId: 1,
      accountType: 1,
      dailyWithdrawalLimit: 1000,
    });

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.value).toEqual(account);
    }
  });

  it('returns error when person missing', async () => {
    repo.personExists.mockResolvedValue(false);

    const result = await service.createAccount({
      personId: 999,
      accountType: 1,
      dailyWithdrawalLimit: 1000,
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.code).toBe('PERSON_NOT_FOUND');
    }
  });

  it('returns balance when account exists', async () => {
    repo.getAccountById.mockResolvedValue({ ...account, balance: 250 });

    const result = await service.getBalance(1);

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.value).toBe(250);
    }
  });

  it('returns error when account balance missing', async () => {
    repo.getAccountById.mockResolvedValue(null);

    const result = await service.getBalance(1);

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.code).toBe('ACCOUNT_NOT_FOUND');
    }
  });

  it('blocks account when it exists', async () => {
    repo.blockAccount.mockResolvedValue({ ...account, activeFlag: false });

    const result = await service.blockAccount(1);

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.value.activeFlag).toBe(false);
    }
  });

  it('returns error when block account missing', async () => {
    repo.blockAccount.mockResolvedValue(null);

    const result = await service.blockAccount(1);

    expect(result.ok).toBe(false);
    
    if (!result.ok) {
      expect(result.error.code).toBe('ACCOUNT_NOT_FOUND');
    }
  });
});
