import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WinstonModule } from 'nest-winston';
import { transports } from 'winston';
import { TransactionService } from './../transaction/transaction.service';

const transport = new transports.DailyRotateFile({
  filename: `logs/transaction-daily-%DATE%.log`,
  datePattern: 'YYYY-MM-DD',
  zippedArchive: false,
  maxFiles: '30d',
});

@Injectable()
export class TasksService {
  private readonly logger = WinstonModule.createLogger({
    transports: [transport],
  });

  constructor(private transactionService: TransactionService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyTransactions() {
    const total = await this.transactionService.getDailyTotalsTransactions(
      new Date().toDateString(),
    );

    this.logger.log({ information: total });
  }
}
