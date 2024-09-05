import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@prisma/client';
import { Request } from 'express';

export interface AuthUserRequest extends Request {
  user: User;
}

export const GetUser = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const request: AuthUserRequest = context.switchToHttp().getRequest();

    if (data) {
      return request.user[data];
    }

    return request.user;
  },
);
