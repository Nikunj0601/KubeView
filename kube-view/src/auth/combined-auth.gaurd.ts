import { Injectable, ExecutionContext, CanActivate } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ApiKeyAuthGuard } from './apiKey-auth.guard'; // Assuming this is your ApiKeyAuthGuard
import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
export class CombinedAuthGuard implements CanActivate {
  public constructor(
    private readonly jwtAuthGaurd: JwtAuthGuard,
    private readonly apiKeyAuthGaurd: ApiKeyAuthGuard,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const canActivateJwtAuthGaurd = this.jwtAuthGaurd.canActivate(context);
    const canActivateApiKeyAuthGaurd =
      this.apiKeyAuthGaurd.canActivate(context);
    console.log(canActivateApiKeyAuthGaurd || canActivateJwtAuthGaurd);

    if (
      canActivateJwtAuthGaurd instanceof Promise ||
      canActivateApiKeyAuthGaurd instanceof Promise
    ) {
      console.log('fyfghvkjg');

      Promise.all([canActivateJwtAuthGaurd, canActivateApiKeyAuthGaurd]).then(
        (results) => console.log('*********', results),
      );
    }

    return canActivateApiKeyAuthGaurd || canActivateJwtAuthGaurd;
  }
}
