import { Body, Controller, Post } from '@nestjs/common';
import { AccountService } from './account.service';
import {
  CreateAccountSchema,
  CreateAccountDto,
} from './dto/create-account.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('accounts')
export class AccountController {
  constructor(private readonly service: AccountService) {}

  @Post()
  async createAccount(
    @Body(new ZodValidationPipe(CreateAccountSchema)) body: CreateAccountDto,
  ) {
    const result = await this.service.createAccount(body);

    if (!result.ok) {
      switch (result.error.code) {
        case 'PERSON_NOT_FOUND':
          return { statusCode: 404, message: result.error.message };
      }
    }

    return result.value;
  }
}
