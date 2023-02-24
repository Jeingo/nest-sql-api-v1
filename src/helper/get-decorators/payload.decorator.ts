import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const PayloadFromRefreshToken = createParamDecorator(
  (data: any, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.payload;
  }
);
