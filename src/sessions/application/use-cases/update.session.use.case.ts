import { CommandHandler } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { IConfigType } from '../../../configuration/configuration';
import { JwtService } from '@nestjs/jwt';
import { SessionsRepository } from '../../infrastructure/sessions.repository';

export class UpdateSessionCommand {
  constructor(public refreshToken: string) {}
}

@CommandHandler(UpdateSessionCommand)
export class UpdateSessionUseCase {
  constructor(
    private readonly configService: ConfigService<IConfigType>,
    private readonly jwtService: JwtService,
    private readonly sessionsRepository: SessionsRepository
  ) {}

  async execute(command: UpdateSessionCommand): Promise<boolean> {
    const refreshToken = command.refreshToken;
    const result = this.jwtService.verify(refreshToken, {
      secret: this.configService.get('JWT_REFRESH_SECRET')
    });
    const issueAt = new Date(result.iat * 1000).toISOString();
    const expireAt = new Date(result.exp * 1000).toISOString();
    const deviceId = result.deviceId;
    return await this.sessionsRepository.updateSession(
      issueAt,
      expireAt,
      deviceId
    );
  }
}
