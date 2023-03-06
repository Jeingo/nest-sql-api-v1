import { CommandHandler } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { IConfigType } from '../../../configuration/configuration';
import { JwtService } from '@nestjs/jwt';
import { SessionsRepository } from '../../infrastructure/sessions-repository.service';

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

  async execute(command: CreateSessionCommand): Promise<string> {
    const refreshToken = command.refreshToken;
    const ip = command.ip;
    const deviceName = command.deviceName;
    const result = this.jwtService.verify(refreshToken, {
      secret: this.configService.get('JWT_REFRESH_SECRET')
    });
    const issueAt = result.iat;
    const expireAt = result.exp;
    const userId = result.userId;
    const deviceId = result.deviceId;

    return await this.sessionsRepository.create(
      issueAt,
      deviceId,
      deviceName,
      ip,
      userId,
      expireAt
    );
  }
}
