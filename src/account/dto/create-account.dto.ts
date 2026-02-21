import { z } from 'zod';

export const CreateAccountSchema = z.object({
  personId: z.number().int().positive(),
  accountType: z.number().int().positive(),
  dailyWithdrawalLimit: z.number().int().nonnegative(),
});

export type CreateAccountDto = z.infer<typeof CreateAccountSchema>;
