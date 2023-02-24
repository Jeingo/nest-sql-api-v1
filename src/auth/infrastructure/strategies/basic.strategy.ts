import { BasicStrategy as Strategy } from 'passport-http';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { IConfigType } from '../../../configuration/configuration';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService<IConfigType>) {
    super();
  }

  public validate = async (username, password): Promise<boolean> => {
    const rootLogin = this.configService.get('BASIC_AUTH_LOGIN');
    const rootPassword = this.configService.get('BASIC_AUTH_PASSWORD');
    if (rootLogin !== username && rootPassword !== password) {
      throw new UnauthorizedException();
    }
    return true;
  };
}
