import { CommandHandler } from '@nestjs/cqrs';
import { DbId } from '../../../../global-types/global.types';
import { InputCreateUserDto } from '../../api/dto/input.create.user.dto';
import { UsersRepository } from '../../../../users/infrastructure/users.repository';

export class CreateUserCommand {
  constructor(public createUserDto: InputCreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: CreateUserCommand): Promise<DbId> {
    const { login, password, email } = command.createUserDto;
    const createdUser = this.usersRepository.create(
      login,
      password,
      email,
      true
    );
    await this.usersRepository.save(createdUser);
    return createdUser._id;
  }
}
