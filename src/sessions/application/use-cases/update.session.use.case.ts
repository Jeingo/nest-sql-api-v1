import { CommandHandler } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { IConfigType } from '../../../configuration/configuration';
import { JwtService } from '@nestjs/jwt';
import { SqlSessionsRepository } from '../../infrastructure/sql.sessions.repository';

export class UpdateSessionCommand {
  constructor(public refreshToken: string) {}
}

@CommandHandler(UpdateSessionCommand)
export class UpdateSessionUseCase {
  constructor(
    private readonly configService: ConfigService<IConfigType>,
    private readonly jwtService: JwtService,
    private readonly sqlSessionsRepository: SqlSessionsRepository
  ) {}

  async execute(command: UpdateSessionCommand): Promise<boolean> {
    const result = this.jwtService.verify(command.refreshToken, {
      secret: this.configService.get('JWT_REFRESH_SECRET')
    });
    const issueAt = result.iat;
    const expireAt = result.exp;
    const deviceId = result.deviceId;
    return await this.sqlSessionsRepository.updateSession(
      issueAt,
      expireAt,
      deviceId
    );
  }
}
