import { Body, Controller, Post, Param, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
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
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.service.deposit({
      accountId: asAccountId(params.accountId),
      value: asMoney(body.value),
    });

    if (!result.ok) {
      switch (result.error.code) {
        case 'ACCOUNT_NOT_FOUND':
          res.status(404);
          return { statusCode: 404, message: result.error.message };
        case 'ACCOUNT_BLOCKED':
          res.status(403);
          return { statusCode: 403, message: result.error.message };
      }

      res.status(500);
      return { statusCode: 500, message: 'Unhandled error' };
    }

    return result.value;
  }

  @Post(':accountId/withdraw')
  async withdraw(
    @Param(new ZodValidationPipe(AccountParamsSchema)) params: AccountParamsDto,
    @Body(new ZodValidationPipe(WithdrawSchema)) body: WithdrawDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.service.withdraw({
      accountId: asAccountId(params.accountId),
      value: asMoney(body.value),
    });

    if (!result.ok) {
      switch (result.error.code) {
        case 'ACCOUNT_NOT_FOUND':
          res.status(404);
          return { statusCode: 404, message: result.error.message };
        case 'ACCOUNT_BLOCKED':
          res.status(403);
          return { statusCode: 403, message: result.error.message };
        case 'INSUFFICIENT_FUNDS':
          res.status(422);
          return { statusCode: 422, message: result.error.message };
        case 'DAILY_LIMIT_EXCEEDED':
          res.status(422);
          return { statusCode: 422, message: result.error.message };
      }

      res.status(500);
      return { statusCode: 500, message: 'Unhandled error' };
    }

    return result.value;
  }

  @Get(':accountId/statements')
  async getStatement(
    @Param(new ZodValidationPipe(AccountParamsSchema)) params: AccountParamsDto,
    @Query(new ZodValidationPipe(StatementQuerySchema))
    query: StatementQueryDto,
    @Res({ passthrough: true }) res: Response,
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
          res.status(404);
          return { statusCode: 404, message: result.error.message };
      }

      res.status(500);
      return { statusCode: 500, message: 'Unhandled error' };
    }

    return result.value;
  }
}
