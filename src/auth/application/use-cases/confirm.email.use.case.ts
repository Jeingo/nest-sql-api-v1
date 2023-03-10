import { CommandHandler } from '@nestjs/cqrs';
import { InputConfirmationCodeDto } from '../../api/dto/input.confirmation.code.dto';
import { UsersRepository } from '../../../users/infrastructure/users.repository';

export class ConfirmEmailCommand {
  constructor(public confirmationCodeDto: InputConfirmationCodeDto) {}
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: ConfirmEmailCommand): Promise<boolean> {
    const code = command.confirmationCodeDto.code;
    await this.usersRepository.updateConfirmationEmail(code);

    return true;
  }
}
