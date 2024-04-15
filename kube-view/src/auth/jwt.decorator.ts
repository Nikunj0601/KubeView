import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { JWTExtractDto } from './jwt-dto.dto';
import { User } from 'src/user/user.entity';

export const JWTExtractData = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JWTExtractDto => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as JWTExtractDto;
  },
);

export const JWTUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();

    const jwtExtract = request.user as JWTExtractDto;

    const user = new User();

    if (!jwtExtract) {
      return user;
    }

    user.id = jwtExtract.id;
    user.email = jwtExtract.email;
    user.username = jwtExtract.username;

    return user;
  },
);
