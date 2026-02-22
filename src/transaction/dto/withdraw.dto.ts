import { z } from 'zod';

export const WithdrawSchema = z.object({
  value: z.coerce.number().positive(),
});

export type WithdrawDto = z.infer<typeof WithdrawSchema>;
