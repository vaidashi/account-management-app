import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from './zod-validation.pipe';

describe('ZodValidationPipe', () => {
  it('returns parsed data when valid', () => {
    const pipe = new ZodValidationPipe(z.object({ amount: z.number() }));

    const result = pipe.transform({ amount: 10 });

    expect(result).toEqual({ amount: 10 });
  });

  it('throws BadRequestException when invalid', () => {
    const pipe = new ZodValidationPipe(z.object({ amount: z.number() }));

    expect(() => pipe.transform({ amount: 'invalid' })).toThrow(
      BadRequestException,
    );
  });
});
