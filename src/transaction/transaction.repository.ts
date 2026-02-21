import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionRecord } from './types';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class TransactionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createDeposit(
    transactionInput: Pick<TransactionRecord, 'accountId' | 'value'>,
  ) {
    return this.prismaService.transaction.create({
      data: {
        accountId: transactionInput.accountId,
        value: new Decimal(transactionInput.value),
      },
    });
  }

  async updateBalance(input: { accountId: number; delta: number }) {
    return this.prismaService.account.update({
      where: { accountId: input.accountId },
      data: {
        balance: { increment: new Decimal(input.delta) },
      },
    });
  }
}
