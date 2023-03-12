import { Injectable, NotFoundException } from '@nestjs/common';
import { OutputUserMeDto } from '../api/dto/output.user.me.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/domain/users.entity';
import { SqlDbId } from '../../global-types/global.types';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>
  ) {}

  async getMeById(id: SqlDbId): Promise<OutputUserMeDto> {
    const result = await this.usersRepository
      .createQueryBuilder()
      .where('id=:id', { id: +id })
      .getOne();

    if (!result) throw new NotFoundException();
    return this._getOutputMeUser(result);
  }
  private _getOutputMeUser(user: User): OutputUserMeDto {
    return {
      email: user.email,
      login: user.login,
      userId: user.id.toString()
    };
  }
}
