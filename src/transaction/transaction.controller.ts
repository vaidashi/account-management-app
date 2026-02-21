import { Body, Controller, Post, Param } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { DepositSchema, DepositDto } from './dto/deposit.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  AccountParamsSchema,
  AccountParamsDto,
} from '../account/dto/account-params.dto';
import { asAccountId, asMoney } from 'src/common/branded-types';

@Controller('accounts')
export class TransactionController {
  constructor(private readonly service: TransactionService) {}

  @Post(':accountId/deposit')
  async deposit(
    @Param(new ZodValidationPipe(AccountParamsSchema)) params: AccountParamsDto,
    @Body(new ZodValidationPipe(DepositSchema)) body: DepositDto,
  ) {
    const result = await this.service.deposit({
      accountId: asAccountId(params.accountId),
      value: asMoney(body.value),
    });

    if (!result.ok) {
      switch (result.error.code) {
        case 'ACCOUNT_NOT_FOUND':
          return { statusCode: 404, message: result.error.message };
        case 'ACCOUNT_BLOCKED':
          return { statusCode: 403, message: result.error.message };
        default:
          const _exhaustive: never = result.error;
          throw new Error(`Unhandled error code: ${(_exhaustive as any).code}`);
      }
    }

    return result.value;
  }
}
