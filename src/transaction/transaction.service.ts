import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionRepository } from './transaction.repository';
import { Result, err, ok } from '../common/result';
import { DepositError, TransactionRecord } from './types';

@Injectable()
export class TransactionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repo: TransactionRepository,
  ) {}

  async deposit(
    transactionInput: Pick<TransactionRecord, 'accountId' | 'value'>,
  ): Promise<Result<{ newBalance: number }, DepositError>> {
    const account = await this.prisma.account.findUnique({
      where: { accountId: transactionInput.accountId },
    });

    if (!account) {
      return err({ code: 'ACCOUNT_NOT_FOUND', message: 'Account not found' });
    }

    if (!account.activeFlag) {
      return err({ code: 'ACCOUNT_BLOCKED', message: 'Account is blocked' });
    }

    const updated = await this.prisma.$transaction(async () => {
      await this.repo.createDeposit(transactionInput);
      return this.repo.updateBalance({
        accountId: transactionInput.accountId,
        delta: transactionInput.value,
      });
    });

    return ok({ newBalance: updated.balance.toNumber() });
  }
}
