import {
  Injectable,
  ExecutionContext,
  CanActivate,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiKeyAuthGuard } from './apiKey-auth.guard'; // Assuming this is your ApiKeyAuthGuard
import { JwtAuthGuard } from './jwt-auth.guard';
import { Reflector } from '@nestjs/core';

@Injectable()
export class CombinedAuthGuard implements CanActivate {
  public constructor(
    private readonly jwtAuthGaurd: JwtAuthGuard,
    private readonly apiKeyAuthGaurd: ApiKeyAuthGuard,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const headers = req.headers;

    const publicRoute = this.reflector.get<boolean>(
      'public-route',
      context.getHandler(),
    );

    if (publicRoute) {
      return true;
    }

    if (headers['x-api-key'] && headers['github-token']) {
      return Boolean(await this.apiKeyAuthGaurd.canActivate(context));
    } else if (headers.authorization) {
      return Boolean(await this.jwtAuthGaurd.canActivate(context));
    } else {
      throw new UnauthorizedException();
    }
  }
}
