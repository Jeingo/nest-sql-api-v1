import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtAdapter } from '../../../adapters/jwt/jwt.service';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { Types } from 'mongoose';

@Injectable()
export class GetUserGuard implements CanActivate {
  constructor(
    private readonly jwtAdapter: JwtAdapter,
    private readonly usersRepository: UsersRepository
  ) {}

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

    const payload = this.jwtAdapter.getAccessTokenPayload(
      authorizationField[1]
    );
    if (!payload) {
      return true;
    }
    const user = await this.usersRepository.getById(
      new Types.ObjectId(payload.userId)
    );
    request.user = { userId: user?._id.toString(), login: user?.login };
    return true;
  }
}
