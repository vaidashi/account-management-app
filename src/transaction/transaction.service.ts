import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionRepository } from './transaction.repository';
import { Result, err, ok } from '../common/result';
import { DepositError, TransactionRecord, WithdrawError } from './types';

@Injectable()
export class TransactionService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly repo: TransactionRepository,
  ) {}

  async deposit(
    transactionInput: Pick<TransactionRecord, 'accountId' | 'value'>,
  ): Promise<Result<{ newBalance: number }, DepositError>> {
    const account = await this.prismaService.account.findUnique({
      where: { accountId: transactionInput.accountId },
    });

    if (!account) {
      return err({ code: 'ACCOUNT_NOT_FOUND', message: 'Account not found' });
    }

    if (!account.activeFlag) {
      return err({ code: 'ACCOUNT_BLOCKED', message: 'Account is blocked' });
    }

    const updated = await this.prismaService.$transaction(async () => {
      await this.repo.createDeposit(transactionInput);
      return this.repo.updateBalance({
        accountId: transactionInput.accountId,
        delta: transactionInput.value,
      });
    });

    return ok({ newBalance: updated.balance.toNumber() });
  }

  async withdraw(
    transactionInput: Pick<TransactionRecord, 'accountId' | 'value'>,
  ): Promise<Result<{ newBalance: number }, WithdrawError>> {
    const account = await this.prismaService.account.findUnique({
      where: { accountId: transactionInput.accountId },
    });

    if (!account) {
      return err({ code: 'ACCOUNT_NOT_FOUND', message: 'Account not found' });
    }

    if (!account.activeFlag) {
      return err({ code: 'ACCOUNT_BLOCKED', message: 'Account is blocked' });
    }

    const currentBalance = account.balance.toNumber();

    if (currentBalance < transactionInput.value) {
      return err({ code: 'INSUFFICIENT_FUNDS', message: 'Insufficient funds' });
    }

    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const withdrawnTodayTotal = await this.repo.getWithdrawnTodayTotal(
      { accountId: transactionInput.accountId },
      startOfDay,
      endOfDay,
    );

    if (
      withdrawnTodayTotal + transactionInput.value >
      account.dailyWithdrawalLimit.toNumber()
    ) {
      return err({
        code: 'DAILY_LIMIT_EXCEEDED',
        message: 'Daily withdrawal limit exceeded',
      });
    }

    const updated = await this.prismaService.$transaction(async () => {
      await this.repo.createWithdrawal(transactionInput);
      return this.repo.updateBalance({
        accountId: transactionInput.accountId,
        delta: -transactionInput.value,
      });
    });

    return ok({ newBalance: updated.balance.toNumber() });
  }

  async getStatement(
    accountId: Pick<TransactionRecord, 'accountId'>,
    limit: number,
    offset: number,
    from?: Date,
    to?: Date,
  ) {
    const account = await this.prismaService.account.findUnique({
      where: { accountId: accountId.accountId },
    });

    if (!account) {
      return err({ code: 'ACCOUNT_NOT_FOUND', message: 'Account not found' });
    }

    const result = await this.repo.getStatement(
      accountId,
      limit,
      offset,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );

    return ok({
      total: result.total,
      items: result.rows,
    });
  }
}
