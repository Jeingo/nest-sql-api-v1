import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { IConfigType } from '../../../configuration/configuration';
import { SqlUsersRepository } from '../../../users/infrastructure/sql.users.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService<IConfigType>,
    private readonly sqlUsersRepository: SqlUsersRepository
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
      passReqToCallback: true
    });
  }

  async validate(req, payload) {
    console.log(req.body);
    const user = await this.sqlUsersRepository.getById(payload.userId);
    if (!user) {
      throw new UnauthorizedException();
    }
    return { userId: user.id.toString(), login: user.login };
  }
}
