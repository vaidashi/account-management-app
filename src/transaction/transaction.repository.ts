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
        transactionDate: new Date(),
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

  async createWithdrawal(
    transactionInput: Pick<TransactionRecord, 'accountId' | 'value'>,
  ) {
    return this.prismaService.transaction.create({
      data: {
        accountId: transactionInput.accountId,
        value: new Decimal(-transactionInput.value),
        transactionDate: new Date(),
      },
    });
  }

  async getWithdrawnTodayTotal(
    accountId: Pick<TransactionRecord, 'accountId'>,
    start: Date,
    end: Date,
  ) {
    const result = await this.prismaService.transaction.aggregate({
      where: {
        accountId: accountId.accountId,
        transactionDate: {
          gte: start,
          lte: end,
        },
        value: {
          lt: 0,
        },
      },
      _sum: {
        value: true,
      },
    });

    const sum = result._sum.value?.toNumber() ?? 0;
    return Math.abs(sum);
  }

  async getStatement(
    accountId: Pick<TransactionRecord, 'accountId'>,
    limit: number,
    offset: number,
    from?: Date,
    to?: Date,
  ) {
    const where = { accountId: accountId.accountId } as const;

    if (from || to) {
      const dateFilter: { gte?: Date; lte?: Date } = {};
      if (from) dateFilter.gte = from;
      if (to) dateFilter.lte = to;
      // @ts-expect-error: Prisma type inferred by client
      where.transactionDate = dateFilter;
    }

    const [rows, total] = await Promise.all([
      this.prismaService.transaction.findMany({
        where,
        orderBy: { transactionDate: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prismaService.transaction.count({ where }),
    ]);

    return { rows, total };
  }
}
