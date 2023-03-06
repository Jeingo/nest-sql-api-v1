import { InputRegistrationUserDto } from '../../api/dto/input.registration.user.dto';
import { EmailManager } from '../../../adapters/email/email.manager';
import { CommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/infrastructure/users-repository.service';
import { SqlDbId } from '../../../global-types/global.types';

export class RegistrationUserCommand {
  constructor(public registrationUserDto: InputRegistrationUserDto) {}
}

@CommandHandler(RegistrationUserCommand)
export class RegistrationUserUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly emailManager: EmailManager
  ) {}

  async execute(command: RegistrationUserCommand): Promise<SqlDbId> {
    const { login, password, email } = command.registrationUserDto;
    const createdUser = await this.usersRepository.create(
      login,
      password,
      email,
      false
    );
    await this.emailManager.sendRegistrationEmailConfirmation(createdUser);
    return createdUser.id.toString();
  }
}
