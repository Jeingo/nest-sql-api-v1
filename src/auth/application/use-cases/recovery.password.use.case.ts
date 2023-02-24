import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { CommandHandler } from '@nestjs/cqrs';
import { EmailManager } from '../../../adapters/email/email.manager';
import { InputRecoveryEmailDto } from '../../api/dto/input.recovery.email.dto';

export class RecoveryPasswordCommand {
  constructor(public recoveryEmailDto: InputRecoveryEmailDto) {}
}

@CommandHandler(RecoveryPasswordCommand)
export class RecoveryPasswordUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly emailManager: EmailManager
  ) {}

  async execute(command: RecoveryPasswordCommand): Promise<boolean> {
    const email = command.recoveryEmailDto.email;
    const user = await this.usersRepository.getByUniqueField(email);
    if (!user) return false;
    user.updatePasswordRecoveryConfirmationCode();
    await this.usersRepository.save(user);
    await this.emailManager.sendPasswordRecoveryEmailConfirmation(user);
    return true;
  }
}
