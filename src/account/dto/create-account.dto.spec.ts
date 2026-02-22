import { CreateAccountSchema } from './create-account.dto';

describe('CreateAccountSchema', () => {
  it('accepts valid payload', () => {
    const result = CreateAccountSchema.safeParse({
      personId: 1,
      accountType: 1,
      dailyWithdrawalLimit: 1000,
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid personId', () => {
    const result = CreateAccountSchema.safeParse({
      personId: -1,
      accountType: 1,
      dailyWithdrawalLimit: 1000,
    });

    expect(result.success).toBe(false);
  });
});
