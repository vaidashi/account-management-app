import { z } from 'zod';

export const StatementQuerySchema = z.object({
  from: z.iso.datetime().optional(),
  to: z.iso.datetime().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type StatementQueryDto = z.infer<typeof StatementQuerySchema>;
