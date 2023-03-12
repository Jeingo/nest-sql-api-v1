import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../domain/users.entity';
import { SqlDbId } from '../../global-types/global.types';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>
  ) {}
  create(
    login: string,
    password: string,
    email: string,
    isConfirmed: boolean
  ): User {
    return User.make(login, password, email, isConfirmed);
  }
  async save(user: User): Promise<User> {
    return await this.usersRepository.save(user);
  }
  async getById(id: SqlDbId): Promise<User> {
    return this.usersRepository.findOneBy({ id: +id });
  }
  async getByUUIDCode(code: string): Promise<User> {
    return this.usersRepository.findOneBy([
      { emailConfirmationCode: code },
      { passwordRecoveryCode: code }
    ]);
  }
  async getByLoginOrEmail(loginOrEmail: string): Promise<User> {
    return this.usersRepository.findOneBy([
      { email: loginOrEmail },
      { login: loginOrEmail }
    ]);
  }
  async delete(id: SqlDbId): Promise<boolean> {
    await this.usersRepository.delete(+id);
    return true;
  }
}
