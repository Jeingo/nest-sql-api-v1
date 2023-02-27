import { CommandHandler } from '@nestjs/cqrs';
import { InputConfirmationCodeDto } from '../../api/dto/input.confirmation.code.dto';
import { SqlUsersRepository } from '../../../users/infrastructure/sql.users.repository';

export class ConfirmEmailCommand {
  constructor(public confirmationCodeDto: InputConfirmationCodeDto) {}
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase {
  constructor(private readonly sqlUsersRepository: SqlUsersRepository) {}

  async execute(command: ConfirmEmailCommand): Promise<boolean> {
    const code = command.confirmationCodeDto.code;
    await this.sqlUsersRepository.updateConfirmationEmail(code);

    return true;
  }
}
