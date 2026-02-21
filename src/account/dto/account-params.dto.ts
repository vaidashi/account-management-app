import { z } from 'zod';

export const AccountParamsSchema = z.object({
  accountId: z.coerce.number().int().positive(),
});

export type AccountParamsDto = z.infer<typeof AccountParamsSchema>;
