import { AccountType } from './account-type';

describe('AccountType', () => {
  it('exposes checking and savings values', () => {
    expect(AccountType.Checking).toBe(1);
    expect(AccountType.Savings).toBe(2);
  });
});
