import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { err, ok } from '../common/result';

describe('TransactionController', () => {
  const service = {
    deposit: jest.fn(),
    withdraw: jest.fn(),
    getStatement: jest.fn(),
  } as unknown as jest.Mocked<TransactionService>;

  const controller = new TransactionController(service);

  const makeResponse = () => ({
    status: jest.fn().mockReturnThis(),
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns deposit result on success', async () => {
    service.deposit.mockResolvedValue(ok({ newBalance: 250 }));

    const response = makeResponse();

    const result = await controller.deposit(
      { accountId: 1 },
      { value: 50 },
      response as any,
    );

    expect(response.status).not.toHaveBeenCalled();
    expect(result).toEqual({ newBalance: 250 });
  });

  it('maps account not found on deposit', async () => {
    service.deposit.mockResolvedValue(
      err({ code: 'ACCOUNT_NOT_FOUND', message: 'Account not found' }),
    );

    const response = makeResponse();

    const result = await controller.deposit(
      { accountId: 999 },
      { value: 50 },
      response as any,
    );

    expect(response.status).toHaveBeenCalledWith(404);
    expect(result).toEqual({ statusCode: 404, message: 'Account not found' });
  });

  it('maps blocked account on withdraw', async () => {
    service.withdraw.mockResolvedValue(
      err({ code: 'ACCOUNT_BLOCKED', message: 'Account is blocked' }),
    );

    const response = makeResponse();

    const result = await controller.withdraw(
      { accountId: 1 },
      { value: 25 },
      response as any,
    );

    expect(response.status).toHaveBeenCalledWith(403);
    expect(result).toEqual({ statusCode: 403, message: 'Account is blocked' });
  });

  it('maps insufficient funds on withdraw', async () => {
    service.withdraw.mockResolvedValue(
      err({ code: 'INSUFFICIENT_FUNDS', message: 'Insufficient funds' }),
    );

    const response = makeResponse();

    const result = await controller.withdraw(
      { accountId: 1 },
      { value: 250 },
      response as any,
    );

    expect(response.status).toHaveBeenCalledWith(422);
    expect(result).toEqual({
      statusCode: 422,
      message: 'Insufficient funds',
    });
  });

  it('maps daily limit exceeded on withdraw', async () => {
    service.withdraw.mockResolvedValue(
      err({ code: 'DAILY_LIMIT_EXCEEDED', message: 'Daily limit exceeded' }),
    );

    const response = makeResponse();

    const result = await controller.withdraw(
      { accountId: 1 },
      { value: 250 },
      response as any,
    );

    expect(response.status).toHaveBeenCalledWith(422);
    expect(result).toEqual({
      statusCode: 422,
      message: 'Daily limit exceeded',
    });
  });

  it('returns statement on success', async () => {
    service.getStatement.mockResolvedValue(ok({ total: 1, items: [] }));

    const response = makeResponse();

    const result = await controller.getStatement(
      { accountId: 1 },
      { limit: 20, offset: 0 },
      response as any,
    );

    expect(response.status).not.toHaveBeenCalled();
    expect(result).toEqual({ total: 1, items: [] });
  });

  it('maps account not found on statements', async () => {
    service.getStatement.mockResolvedValue(
      err({ code: 'ACCOUNT_NOT_FOUND', message: 'Account not found' }),
    );

    const response = makeResponse();

    const result = await controller.getStatement(
      { accountId: 999 },
      { limit: 20, offset: 0 },
      response as any,
    );

    expect(response.status).toHaveBeenCalledWith(404);
    expect(result).toEqual({ statusCode: 404, message: 'Account not found' });
  });
});
