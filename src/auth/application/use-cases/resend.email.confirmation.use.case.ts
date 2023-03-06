import { CommandHandler } from '@nestjs/cqrs';
import { InputEmailDto } from '../../api/dto/input.email.dto';
import { EmailManager } from '../../../adapters/email/email.manager';
import { UsersRepository } from '../../../users/infrastructure/users-repository.service';

export class ResendEmailConfirmationCommand {
  constructor(public emailDto: InputEmailDto) {}
}

@CommandHandler(ResendEmailConfirmationCommand)
export class ResendEmailConfirmationUseCase {
  constructor(
    private readonly sqlUsersRepository: UsersRepository,
    private readonly emailManager: EmailManager
  ) {}

  async execute(command: ResendEmailConfirmationCommand): Promise<boolean> {
    const email = command.emailDto.email;
    const user = await this.sqlUsersRepository.updateConfirmationCode(email);
    await this.emailManager.sendRegistrationEmailConfirmation(user);
    return true;
  }
}
