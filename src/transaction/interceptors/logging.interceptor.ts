import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { transports } from 'winston';
import 'winston-daily-rotate-file';

const transport = new transports.DailyRotateFile({
  filename: `logs/transaction-%DATE%.log`,
  datePattern: 'YYYY-MM-DD',
  zippedArchive: false,
  maxFiles: '30d',
});

@Injectable()
export class TransactionLoggingInterceptor implements NestInterceptor {
  private readonly logger = WinstonModule.createLogger({
    transports: [transport],
  });

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map(async (data) => {
        this.logger.log(data);

        return { reference_id: data.id };
      }),
    );
  }
}
