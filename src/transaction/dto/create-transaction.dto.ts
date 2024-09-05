import { IsNumber } from 'class-validator';

export class CreateTransactionDto {
  @IsNumber()
  amount: number;

  @IsNumber()
  user_id: number;
}
