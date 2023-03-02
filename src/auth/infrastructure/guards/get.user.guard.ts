import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtAdapter } from '../../../adapters/jwt/jwt.service';
import { SqlUsersRepository } from '../../../users/infrastructure/sql.users.repository';

@Injectable()
export class GetUserGuard implements CanActivate {
  constructor(
    private readonly jwtAdapter: JwtAdapter,
    private readonly sqlUsersRepository: SqlUsersRepository
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
    const user = await this.sqlUsersRepository.getById(payload.userId);
    request.user = { userId: user?.id.toString(), login: user?.login };
    return true;
  }
}
