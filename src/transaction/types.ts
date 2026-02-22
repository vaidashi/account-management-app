import { AccountId, Money, TransactionId } from 'src/common/branded-types';

export type DepositError =
  | { code: 'ACCOUNT_NOT_FOUND'; message: string }
  | { code: 'ACCOUNT_BLOCKED'; message: string };

export type TransactionRecord = {
  transactionId: TransactionId;
  accountId: AccountId;
  value: Money;
  transactionDate: Date;
};

export type WithdrawError =
  | { code: 'ACCOUNT_NOT_FOUND'; message: string }
  | { code: 'ACCOUNT_BLOCKED'; message: string }
  | { code: 'INSUFFICIENT_FUNDS'; message: string }
  | { code: 'DAILY_LIMIT_EXCEEDED'; message: string };
