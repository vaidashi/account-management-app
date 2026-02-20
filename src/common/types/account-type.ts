export const AccountType = {
  Checking: 1,
  Savings: 2,
} as const;

export type AccountType = (typeof AccountType)[keyof typeof AccountType];
