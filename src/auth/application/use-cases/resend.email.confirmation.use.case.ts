import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { CommandHandler } from '@nestjs/cqrs';
import { InputEmailDto } from '../../api/dto/input.email.dto';
import { EmailManager } from '../../../adapters/email/email.manager';

export class ResendEmailConfirmationCommand {
  constructor(public emailDto: InputEmailDto) {}
}

@CommandHandler(ResendEmailConfirmationCommand)
export class ResendEmailConfirmationUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly emailManager: EmailManager
  ) {}

  async execute(command: ResendEmailConfirmationCommand): Promise<boolean> {
    const email = command.emailDto.email;
    const user = await this.usersRepository.getByUniqueField(email);
    user.updateConfirmationCode();
    await this.usersRepository.save(user);
    await this.emailManager.sendRegistrationEmailConfirmation(user);
    return true;
  }
}
