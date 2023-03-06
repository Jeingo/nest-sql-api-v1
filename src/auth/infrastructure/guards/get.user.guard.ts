import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtAdapter } from '../../../adapters/jwt/jwt.service';

@Injectable()
export class GetUserGuard implements CanActivate {
  constructor(private readonly jwtAdapter: JwtAdapter) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;
    if (!authorization) {
      return true;
    }

    const authorizationField = authorization.split(' ');
    if (authorizationField[0] !== 'Bearer') {
      return true;
    }
    if (!this.jwtAdapter.checkExpirationAccessToken(authorizationField[1])) {
      return true;
    }
    const payload = this.jwtAdapter.getAccessTokenPayload(
      authorizationField[1]
    );
    request.user = { userId: payload.userId };
    return true;
  }
}
