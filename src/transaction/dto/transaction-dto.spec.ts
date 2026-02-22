import { DepositSchema } from './deposit.dto';
import { WithdrawSchema } from './withdraw.dto';
import { StatementQuerySchema } from './statement-query.dto';

describe('Transaction DTO schemas', () => {
  it('validates deposit value', () => {
    const result = DepositSchema.safeParse({ value: 10 });
    expect(result.success).toBe(true);
  });

  it('rejects negative withdraw value', () => {
    const result = WithdrawSchema.safeParse({ value: -5 });
    expect(result.success).toBe(false);
  });

  it('validates statement query defaults', () => {
    const result = StatementQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    
    if (result.success) {
      expect(result.data.limit).toBe(20);
      expect(result.data.offset).toBe(0);
    }
  });
});
