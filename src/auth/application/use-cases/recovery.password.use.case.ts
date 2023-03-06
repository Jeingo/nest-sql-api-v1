import { CommandHandler } from '@nestjs/cqrs';
import { EmailManager } from '../../../adapters/email/email.manager';
import { InputRecoveryEmailDto } from '../../api/dto/input.recovery.email.dto';
import { UsersRepository } from '../../../users/infrastructure/users-repository.service';

export class RecoveryPasswordCommand {
  constructor(public recoveryEmailDto: InputRecoveryEmailDto) {}
}

@CommandHandler(RecoveryPasswordCommand)
export class RecoveryPasswordUseCase {
  constructor(
    private readonly sqlUsersRepository: UsersRepository,
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
