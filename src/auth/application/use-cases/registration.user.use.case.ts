import { InputRegistrationUserDto } from '../../api/dto/input.registration.user.dto';
import { DbId } from '../../../global-types/global.types';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { EmailManager } from '../../../adapters/email/email.manager';
import { CommandHandler } from '@nestjs/cqrs';

export class RegistrationUserCommand {
  constructor(public registrationUserDto: InputRegistrationUserDto) {}
}

@CommandHandler(RegistrationUserCommand)
export class RegistrationUserUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly emailManager: EmailManager
  ) {}

  async execute(command: RegistrationUserCommand): Promise<DbId> {
    const { login, password, email } = command.registrationUserDto;
    const createdUser = this.usersRepository.create(
      login,
      password,
      email,
      false
    );
    await this.usersRepository.save(createdUser);
    await this.emailManager.sendRegistrationEmailConfirmation(createdUser);
    return createdUser._id;
  }
}
