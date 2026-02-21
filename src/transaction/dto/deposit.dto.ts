import { z } from 'zod';

export const DepositSchema = z.object({
  value: z.coerce.number().positive(),
});

export type DepositDto = z.infer<typeof DepositSchema>;
