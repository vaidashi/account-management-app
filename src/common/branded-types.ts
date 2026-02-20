export type Brand<T, B extends string> = T & { readonly __brand: B };

export type PersonId = Brand<number, 'PersonId'>;
export type AccountId = Brand<number, 'AccountId'>;
export type TransactionId = Brand<number, 'TransactionId'>;
export type Money = Brand<number, 'Money'>;

export const asAccountId = (value: number): AccountId => value as AccountId;
export const asPersonId = (value: number): PersonId => value as PersonId;
export const asTransactionId = (value: number): TransactionId =>
  value as TransactionId;

export const asMoney = (value: number): Money => {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(
      `Invalid money value: ${value}. It must be a non-negative finite number.`,
    );
  }
  return value as Money;
};
