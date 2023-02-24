import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { CommandHandler } from '@nestjs/cqrs';
import { InputLoginUserDto } from '../../api/dto/input.login.user.dto';
import bcrypt from 'bcrypt';
import { DbId } from '../../../global-types/global.types';
import { UnauthorizedException } from '@nestjs/common';

export class ValidateUserInLoginCommand {
  constructor(public loginUserDto: InputLoginUserDto) {}
}

@CommandHandler(ValidateUserInLoginCommand)
export class ValidateUserInLoginUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: ValidateUserInLoginCommand): Promise<DbId> {
    const { loginOrEmail, password } = command.loginUserDto;
    const user = await this.usersRepository.getByUniqueField(loginOrEmail);
    if (!user || user.banInfo.isBanned) throw new UnauthorizedException();
    const result = await bcrypt.compare(password, user.hash);
    if (!result) throw new UnauthorizedException();
    return user._id;
  }
}
