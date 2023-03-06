import { CommandHandler } from '@nestjs/cqrs';
import { InputCreateUserDto } from '../../api/dto/input.create.user.dto';
import { UsersRepository } from '../../../../users/infrastructure/users-repository.service';
import { SqlDbId } from '../../../../global-types/global.types';

export class CreateUserCommand {
  constructor(public createUserDto: InputCreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: CreateUserCommand): Promise<SqlDbId> {
    const { login, password, email } = command.createUserDto;
    const user = await this.usersRepository.create(
      login,
      password,
      email,
      true
    );
    return user.id.toString();
  }
}
