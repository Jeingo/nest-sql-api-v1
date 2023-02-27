import { CommandHandler } from '@nestjs/cqrs';
import { InputNewPasswordDto } from '../../api/dto/input.newpassword.dto';
import { SqlUsersRepository } from '../../../users/infrastructure/sql.users.repository';

export class SetNewPasswordCommand {
  constructor(public newPasswordDto: InputNewPasswordDto) {}
}

@CommandHandler(SetNewPasswordCommand)
export class SetNewPasswordUseCase {
  constructor(private readonly sqlUsersRepository: SqlUsersRepository) {}

  async execute(command: SetNewPasswordCommand): Promise<boolean> {
    const { recoveryCode, newPassword } = command.newPasswordDto;
    await this.sqlUsersRepository.updatePassword(recoveryCode, newPassword);
    return true;
  }
}
