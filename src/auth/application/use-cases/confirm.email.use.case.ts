import { CommandHandler } from '@nestjs/cqrs';
import { InputConfirmationCodeDto } from '../../api/dto/input.confirmation.code.dto';
import { UsersRepository } from '../../../users/infrastructure/users-repository.service';

export class ConfirmEmailCommand {
  constructor(public confirmationCodeDto: InputConfirmationCodeDto) {}
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase {
  constructor(private readonly sqlUsersRepository: UsersRepository) {}

  async execute(command: ConfirmEmailCommand): Promise<boolean> {
    const code = command.confirmationCodeDto.code;
    await this.sqlUsersRepository.updateConfirmationEmail(code);

    return true;
  }
}
