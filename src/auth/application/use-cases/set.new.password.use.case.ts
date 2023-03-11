import { CommandHandler } from '@nestjs/cqrs';
import { InputNewPasswordDto } from '../../api/dto/input.newpassword.dto';
import { UsersRepository } from '../../../users/infrastructure/users.repository';

export class SetNewPasswordCommand {
  constructor(public newPasswordDto: InputNewPasswordDto) {}
}

@CommandHandler(SetNewPasswordCommand)
export class SetNewPasswordUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: SetNewPasswordCommand): Promise<boolean> {
    const { recoveryCode, newPassword } = command.newPasswordDto;
    const user = await this.usersRepository.getByUUIDCode(recoveryCode);
    user.updatePassword(newPassword);
    await this.usersRepository.save(user);
    return true;
  }
}
