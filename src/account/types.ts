import { AccountId, PersonId } from '../common/branded-types';

export type AccountRecord = {
  accountId: AccountId;
  personId: PersonId;
  balance: number;
  dailyWithdrawalLimit: number;
  activeFlag: boolean;
  accountType: number;
  createDate: Date;
};

export type CreateAccountError = { code: 'PERSON_NOT_FOUND'; message: string };
