import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { CreateTransactionDto } from './dto';

enum TransactionType {
  ADDITION = 'ADDITION',
  SUBTRACTION = 'SUBTRACTION',
}

@Injectable()
export class TransactionService {
  constructor(private prisma: PrismaService) {}

  async createTransaction(dto: CreateTransactionDto) {
    const { user_id: userId, amount } = dto;

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    const result = await this.prisma.$transaction([
      this.prisma.transaction.create({
        data: {
          userId,
          amount,
          type:
            dto.amount < 0
              ? TransactionType.SUBTRACTION
              : TransactionType.ADDITION,
        },
      }),
      this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          balance: { increment: amount },
        },
      }),
    ]);

    if (!result[0]) throw new InternalServerErrorException();

    return result[0];
  }

  getTransactions() {
    return this.prisma.transaction.findMany();
  }

  async getDailyTotalsTransactions(date: string) {
    if (new Date(date).toString() === 'Invalid Date')
      throw new BadRequestException('Date is not valid');

    const transactions = await this.prisma.transaction.aggregate({
      where: {
        createdAt: {
          gte: new Date(date),
          lte: new Date(new Date(date).setHours(24)),
        },
      },
      _sum: {
        amount: true,
      },
    });

    return {
      date: new Date(date).toDateString(),
      total: transactions._sum.amount,
    };
  }
}
