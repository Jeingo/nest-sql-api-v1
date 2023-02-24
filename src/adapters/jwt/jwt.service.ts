import { Injectable } from '@nestjs/common';
import {
  Token,
  RefreshTokenPayloadType,
  Tokens,
  AccessTokenPayloadType
} from './types/jwt.type';
import { ConfigService } from '@nestjs/config';
import { IConfigType } from '../../configuration/configuration';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAdapter {
  constructor(
    private readonly configService: ConfigService<IConfigType>,
    private readonly jwtService: JwtService
  ) {}
  getTokens(userId: string, deviceId: string): Tokens {
    const accessToken = this.createJWT(userId);
    const refreshToken = this.createRefreshJWT(userId, deviceId);
    return {
      accessToken: accessToken,
      refreshToken: refreshToken
    };
  }
  checkExpirationRefreshToken(token: Token): boolean {
    try {
      this.jwtService.verify(token, {
        secret: this.configService.get('JWT_REFRESH_SECRET')
      });
      return true;
    } catch {
      return false;
    }
  }
  getRefreshTokenPayload(refreshToken: Token): RefreshTokenPayloadType | null {
    try {
      return this.jwtService.decode(refreshToken) as RefreshTokenPayloadType;
    } catch {
      return null;
    }
  }
  getAccessTokenPayload(accessToken: Token): AccessTokenPayloadType | null {
    try {
      return this.jwtService.decode(accessToken) as AccessTokenPayloadType;
    } catch {
      return null;
    }
  }
  private createJWT(userId: string): Token {
    return this.jwtService.sign(
      { userId: userId },
      {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('EXPIRE_JWT')
      }
    );
  }
  private createRefreshJWT(userId: string, deviceId: string): Token {
    return this.jwtService.sign(
      { userId: userId, deviceId: deviceId },
      {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('EXPIRE_REFRESH_JWT')
      }
    );
  }
}
