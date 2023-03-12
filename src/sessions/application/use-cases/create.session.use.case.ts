import { CommandHandler } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { IConfigType } from '../../../configuration/configuration';
import { JwtService } from '@nestjs/jwt';
import { SessionsRepository } from '../../infrastructure/sessions.repository';
import { SqlDbId } from '../../../global-types/global.types';

export class CreateSessionCommand {
  constructor(
    public refreshToken: string,
    public ip: string,
    public deviceName: string
  ) {}
}

@CommandHandler(CreateSessionCommand)
export class CreateSessionUseCase {
  constructor(
    private readonly configService: ConfigService<IConfigType>,
    private readonly jwtService: JwtService,
    private readonly sessionsRepository: SessionsRepository
  ) {}

  async execute(command: CreateSessionCommand): Promise<SqlDbId> {
    const refreshToken = command.refreshToken;
    const ip = command.ip;
    const deviceName = command.deviceName;
    const result = this.jwtService.verify(refreshToken, {
      secret: this.configService.get('JWT_REFRESH_SECRET')
    });
    const issueAt = result.iat * 1000;
    const expireAt = result.exp * 1000;
    const userId = result.userId;
    const deviceId = result.deviceId;

    const session = this.sessionsRepository.create(
      issueAt,
      deviceId,
      deviceName,
      ip,
      userId,
      expireAt
    );
    await this.sessionsRepository.save(session);
    return session.id.toString();
  }
}
