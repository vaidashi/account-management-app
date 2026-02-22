import { Body, Controller, Post, Param, Get, Query } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { DepositSchema, DepositDto } from './dto/deposit.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  AccountParamsSchema,
  AccountParamsDto,
} from '../account/dto/account-params.dto';
import { asAccountId, asMoney } from 'src/common/branded-types';
import { WithdrawSchema, WithdrawDto } from './dto/withdraw.dto';
import {
  StatementQuerySchema,
  StatementQueryDto,
} from './dto/statement-query.dto';

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
      }

      return { statusCode: 500, message: 'Unhandled error' };
    }

    return result.value;
  }

  @Post(':accountId/withdraw')
  async withdraw(
    @Param(new ZodValidationPipe(AccountParamsSchema)) params: AccountParamsDto,
    @Body(new ZodValidationPipe(WithdrawSchema)) body: WithdrawDto,
  ) {
    const result = await this.service.withdraw({
      accountId: asAccountId(params.accountId),
      value: asMoney(body.value),
    });

    if (!result.ok) {
      switch (result.error.code) {
        case 'ACCOUNT_NOT_FOUND':
          return { statusCode: 404, message: result.error.message };
        case 'ACCOUNT_BLOCKED':
          return { statusCode: 403, message: result.error.message };
        case 'INSUFFICIENT_FUNDS':
          return { statusCode: 422, message: result.error.message };
        case 'DAILY_LIMIT_EXCEEDED':
          return { statusCode: 422, message: result.error.message };
      }

      return { statusCode: 500, message: 'Unhandled error' };
    }

    return result.value;
  }

  @Get(':accountId/statements')
  async getStatement(
    @Param(new ZodValidationPipe(AccountParamsSchema)) params: AccountParamsDto,
    @Query(new ZodValidationPipe(StatementQuerySchema))
    query: StatementQueryDto,
  ) {
    const fromDate = query.from ? new Date(query.from) : undefined;
    const toDate = query.to ? new Date(query.to) : undefined;

    const result = await this.service.getStatement(
      { accountId: asAccountId(params.accountId) },
      query.limit,
      query.offset,
      fromDate,
      toDate,
    );

    if (!result.ok) {
      switch (result.error.code) {
        case 'ACCOUNT_NOT_FOUND':
          return { statusCode: 404, message: result.error.message };
        default:
          throw new Error(`Unhandled error code: ${result.error.code}`);
      }
    }

    return result.value;
  }
}
