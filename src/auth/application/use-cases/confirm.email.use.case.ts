import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { CommandHandler } from '@nestjs/cqrs';
import { InputConfirmationCodeDto } from '../../api/dto/input.confirmation.code.dto';

export class ConfirmEmailCommand {
  constructor(public confirmationCodeDto: InputConfirmationCodeDto) {}
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: ConfirmEmailCommand): Promise<boolean> {
    const code = command.confirmationCodeDto.code;
    const user = await this.usersRepository.getByUniqueField(code);
    user.updateEmailConfirmationStatus();
    await this.usersRepository.save(user);
    return true;
  }
}
