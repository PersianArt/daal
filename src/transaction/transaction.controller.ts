import { Controller, Get, Query } from '@nestjs/common';
import { TransactionService } from './transaction.service';

@Controller('transaction')
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  @Get()
  getTransaction() {
    return this.transactionService.getTransactions();
  }

  @Get('daily')
  getBalance(@Query('date') date: string) {
    return this.transactionService.getDailyTotalsTransactions(date);
  }
}
