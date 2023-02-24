import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { IConfigType } from '../../../configuration/configuration';
import { Types } from 'mongoose';
import { UsersRepository } from '../../../users/infrastructure/users.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService<IConfigType>,
    private readonly usersRepository: UsersRepository
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET
    });
  }

  async validate(payload) {
    const user = await this.usersRepository.getById(
      new Types.ObjectId(payload.userId)
    );
    if (!user) {
      throw new UnauthorizedException();
    }
    return { userId: user._id.toString(), login: user.login };
  }
}
