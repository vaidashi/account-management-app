import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PersonId, asAccountId, asPersonId } from '../common/branded-types';
import { AccountRecord } from './types';

@Injectable()
export class AccountRepository {
  constructor(private readonly prisma: PrismaService) {}

  async personExists(personId: PersonId): Promise<boolean> {
    const count = await this.prisma.person.count({
      where: { personId },
    });
    return count > 0;
  }

  async createAccount(
    accountInput: Pick<
      AccountRecord,
      'personId' | 'accountType' | 'dailyWithdrawalLimit'
    >,
  ): Promise<AccountRecord> {
    const account = await this.prisma.account.create({
      data: {
        personId: accountInput.personId,
        accountType: accountInput.accountType,
        dailyWithdrawalLimit: accountInput.dailyWithdrawalLimit,
        balance: 0, // New accounts start with a balance of 0
        activeFlag: true, // New accounts are active by default
      },
    });

    return {
      ...account,
      accountId: asAccountId(account.accountId),
      personId: asPersonId(account.personId),
      balance: account.balance.toNumber(),
      dailyWithdrawalLimit: account.dailyWithdrawalLimit.toNumber(),
    };
  }
}
