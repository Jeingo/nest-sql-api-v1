import { CommandHandler } from '@nestjs/cqrs';
import { EmailManager } from '../../../adapters/email/email.manager';
import { InputRecoveryEmailDto } from '../../api/dto/input.recovery.email.dto';
import { SqlUsersRepository } from '../../../users/infrastructure/sql.users.repository';

export class RecoveryPasswordCommand {
  constructor(public recoveryEmailDto: InputRecoveryEmailDto) {}
}

@CommandHandler(RecoveryPasswordCommand)
export class RecoveryPasswordUseCase {
  constructor(
    private readonly sqlUsersRepository: SqlUsersRepository,
    private readonly emailManager: EmailManager
  ) {}

  async execute(command: RecoveryPasswordCommand): Promise<boolean> {
    const email = command.recoveryEmailDto.email;
    const user =
      await this.sqlUsersRepository.updatePasswordRecoveryConfirmationCode(
        email
      );
    if (!user) return false;
    await this.emailManager.sendPasswordRecoveryEmailConfirmation(user);
    return true;
  }
}
