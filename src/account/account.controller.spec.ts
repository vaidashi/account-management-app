import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { err, ok } from '../common/result';
import { AccountRecord } from './types';
import { asAccountId, asPersonId } from '../common/branded-types';

describe('AccountController', () => {
  const service = {
    createAccount: jest.fn(),
    getBalance: jest.fn(),
    blockAccount: jest.fn(),
  } as unknown as jest.Mocked<AccountService>;

  const controller = new AccountController(service);

  const makeResponse = () => ({
    status: jest.fn().mockReturnThis(),
  });

  const account: AccountRecord = {
    accountId: asAccountId(1),
    personId: asPersonId(2),
    balance: 100,
    dailyWithdrawalLimit: 500,
    activeFlag: true,
    accountType: 1,
    createDate: new Date('2026-02-01T00:00:00.000Z'),
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns created account on success', async () => {
    service.createAccount.mockResolvedValue(ok(account));

    const response = makeResponse();

    const result = await controller.createAccount(
      {
        personId: 2,
        accountType: 1,
        dailyWithdrawalLimit: 500,
      },
      response as any,
    );

    expect(response.status).not.toHaveBeenCalled();
    expect(result).toEqual(account);
  });

  it('maps person not found on create', async () => {
    service.createAccount.mockResolvedValue(
      err({ code: 'PERSON_NOT_FOUND', message: 'Person not found' }),
    );

    const response = makeResponse();

    const result = await controller.createAccount(
      {
        personId: 999,
        accountType: 1,
        dailyWithdrawalLimit: 500,
      },
      response as any,
    );

    expect(response.status).toHaveBeenCalledWith(404);
    expect(result).toEqual({ statusCode: 404, message: 'Person not found' });
  });

  it('returns balance on success', async () => {
    service.getBalance.mockResolvedValue(ok(250));

    const response = makeResponse();

    const result = await controller.getBalance(
      { accountId: 1 },
      response as any,
    );

    expect(response.status).not.toHaveBeenCalled();
    expect(result).toEqual({ balance: 250 });
  });

  it('maps account not found on balance lookup', async () => {
    service.getBalance.mockResolvedValue(
      err({ code: 'ACCOUNT_NOT_FOUND', message: 'Account not found' }),
    );

    const response = makeResponse();

    const result = await controller.getBalance(
      { accountId: 999 },
      response as any,
    );

    expect(response.status).toHaveBeenCalledWith(404);
    expect(result).toEqual({ statusCode: 404, message: 'Account not found' });
  });

  it('returns blocked account on success', async () => {
    service.blockAccount.mockResolvedValue(
      ok({ ...account, activeFlag: false }),
    );

    const response = makeResponse();

    const result = await controller.blockAccount(
      { accountId: 1 },
      response as any,
    );

    expect(response.status).not.toHaveBeenCalled();
    expect(result).toEqual({ ...account, activeFlag: false });
  });

  it('maps account not found on block', async () => {
    service.blockAccount.mockResolvedValue(
      err({ code: 'ACCOUNT_NOT_FOUND', message: 'Account not found' }),
    );

    const response = makeResponse();

    const result = await controller.blockAccount(
      { accountId: 999 },
      response as any,
    );

    expect(response.status).toHaveBeenCalledWith(404);
    expect(result).toEqual({ statusCode: 404, message: 'Account not found' });
  });
});
