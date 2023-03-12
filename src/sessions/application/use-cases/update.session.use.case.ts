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
    const result = this.jwtService.verify(command.refreshToken, {
      secret: this.configService.get('JWT_REFRESH_SECRET')
    });
    const issueAt = result.iat * 1000;
    const expireAt = result.exp * 1000;
    const deviceId = result.deviceId;

    const session = await this.sessionsRepository.getByDeviceId(deviceId);
    session.update(issueAt, expireAt);
    await this.sessionsRepository.save(session);
    return true;
  }
}
