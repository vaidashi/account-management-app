import { Body, Controller, Post, Param, Patch, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { AccountService } from './account.service';
import {
  CreateAccountSchema,
  CreateAccountDto,
} from './dto/create-account.dto';
import {
  AccountParamsDto,
  AccountParamsSchema,
} from './dto/account-params.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('accounts')
export class AccountController {
  constructor(private readonly service: AccountService) {}

  @Post()
  async createAccount(
    @Body(new ZodValidationPipe(CreateAccountSchema)) body: CreateAccountDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.service.createAccount(body);

    if (!result.ok) {
      switch (result.error.code) {
        case 'PERSON_NOT_FOUND':
          res.status(404);
          return { statusCode: 404, message: result.error.message };
      }

      res.status(500);
      return { statusCode: 500, message: 'Unhandled error' };
    }

    return result.value;
  }

  @Get(':accountId/balance')
  async getBalance(
    @Param(new ZodValidationPipe(AccountParamsSchema)) params: AccountParamsDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.service.getBalance(params.accountId);

    if (!result.ok) {
      switch (result.error.code) {
        case 'ACCOUNT_NOT_FOUND':
          res.status(404);
          return { statusCode: 404, message: result.error.message };
      }

      res.status(500);
      return { statusCode: 500, message: 'Unhandled error' };
    }

    return { balance: result.value };
  }

  @Patch(':accountId/block')
  async blockAccount(
    @Param(new ZodValidationPipe(AccountParamsSchema)) params: AccountParamsDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.service.blockAccount(params.accountId);

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
