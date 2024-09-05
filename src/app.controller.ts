import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { CreateTransactionDto } from './transaction/dto';
import { TransactionLoggingInterceptor } from './transaction/interceptors';
import { TransactionService } from './transaction/transaction.service';
import { UserService } from './user/user.service';

@Controller()
export class AppController {
  constructor(
    private userService: UserService,
    private transactionService: TransactionService,
  ) {}

  @Get('balance')
  getBalance(@Query('user_id', ParseIntPipe) userId: number) {
    return this.userService.getUserBalance(userId);
  }

  @Post('money')
  @UseInterceptors(TransactionLoggingInterceptor)
  createTransaction(@Body() dto: CreateTransactionDto) {
    return this.transactionService.createTransaction(dto);
  }
}
