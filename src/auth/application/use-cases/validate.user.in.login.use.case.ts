import { CommandHandler } from '@nestjs/cqrs';
import { InputLoginUserDto } from '../../api/dto/input.login.user.dto';
import bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';
import { UsersRepository } from '../../../users/infrastructure/users-repository.service';

export class ValidateUserInLoginCommand {
  constructor(public loginUserDto: InputLoginUserDto) {}
}

@CommandHandler(ValidateUserInLoginCommand)
export class ValidateUserInLoginUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: ValidateUserInLoginCommand): Promise<string> {
    const { loginOrEmail, password } = command.loginUserDto;
    const user = await this.usersRepository.getByLoginOrEmail(loginOrEmail);
    if (!user || user.isBanned) throw new UnauthorizedException();
    const result = await bcrypt.compare(password, user.hash);
    if (!result) throw new UnauthorizedException();
    return user.id.toString();
  }
}
