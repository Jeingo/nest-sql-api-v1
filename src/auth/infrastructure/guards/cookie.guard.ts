import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import {
  RefreshTokenPayloadType,
  Token
} from '../../../adapters/jwt/types/jwt.type';
import { JwtAdapter } from '../../../adapters/jwt/jwt.service';
import { SessionsRepository } from '../../../sessions/infrastructure/sessions.repository';

@Injectable()
export class CookieGuard implements CanActivate {
  constructor(
    private readonly jwtAdapter: JwtAdapter,
    private readonly sessionsRepository: SessionsRepository
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const refreshToken = request.cookies?.refreshToken;
    const payload = await this.checkAuthorizationAndGetPayload(refreshToken);
    if (!payload) {
      throw new UnauthorizedException();
    }
    request.payload = payload;
    return true;
  }
  private async checkAuthorizationAndGetPayload(
    refreshToken: Token
  ): Promise<RefreshTokenPayloadType | false> {
    const result = this.jwtAdapter.checkExpirationRefreshToken(refreshToken);
    if (!result) return false;
    const payload = this.jwtAdapter.getRefreshTokenPayload(refreshToken);
    const statusSession = await this.isActiveSession(payload.deviceId);
    if (!statusSession) return false;
    return payload;
  }
  private async isActiveSession(deviceId: string): Promise<boolean> {
    const result = await this.sessionsRepository.get(deviceId);
    return !!result;
  }
}
