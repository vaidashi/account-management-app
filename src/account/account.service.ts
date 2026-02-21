import { Injectable } from '@nestjs/common';
import { AccountRepository } from './account.repository';
import { Result, err, ok } from '../common/result';
import { CreateAccountDto } from './dto/create-account.dto';
import { asPersonId, asAccountId } from '../common/branded-types';
import {
  AccountRecord,
  CreateAccountError,
  AccountNotFoundError,
} from './types';

@Injectable()
export class AccountService {
  constructor(private readonly repo: AccountRepository) {}

  async createAccount(
    accountInput: CreateAccountDto,
  ): Promise<Result<AccountRecord, CreateAccountError>> {
    const personId = asPersonId(accountInput.personId);

    const exists = await this.repo.personExists(personId);

    if (!exists) {
      return err({ code: 'PERSON_NOT_FOUND', message: 'Person not found' });
    }

    const account = await this.repo.createAccount({
      ...accountInput,
      personId,
    });

    return ok(account);
  }

  async getBalance(
    accountId: number,
  ): Promise<Result<number, AccountNotFoundError>> {
    const account = await this.repo.getAccountById(asAccountId(accountId));

    if (!account) {
      return err({ code: 'ACCOUNT_NOT_FOUND', message: 'Account not found' });
    }

    return ok(account.balance);
  }

  async blockAccount(
    accountId: number,
  ): Promise<Result<AccountRecord, AccountNotFoundError>> {
    const account = await this.repo.blockAccount(asAccountId(accountId));

    if (!account) {
      return err({ code: 'ACCOUNT_NOT_FOUND', message: 'Account not found' });
    }

    return ok(account);
  }
}
