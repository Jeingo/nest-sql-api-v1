import { CommandHandler } from '@nestjs/cqrs';
import { InputCreateUserDto } from '../../api/dto/input.create.user.dto';
import { SqlUsersRepository } from '../../../../users/infrastructure/sql.users.repository';
import { SqlDbId } from '../../../../global-types/global.types';

export class CreateUserCommand {
  constructor(public createUserDto: InputCreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase {
  constructor(private readonly sqlUsersRepository: SqlUsersRepository) {}

  async execute(command: CreateUserCommand): Promise<SqlDbId> {
    const { login, password, email } = command.createUserDto;
    const user = await this.sqlUsersRepository.create(
      login,
      password,
      email,
      true
    );
    return user.id.toString();
  }
}
