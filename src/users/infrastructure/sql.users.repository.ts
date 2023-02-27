import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IUserModel, User, UserDocument } from '../domain/entities/user.entity';
import { DbId } from '../../global-types/global.types';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SqlUsersRepository {
  constructor(
    @InjectModel(User.name) private usersModel: IUserModel,
    @InjectDataSource() private readonly dataSource: DataSource
  ) {}

  async create(
    login: string,
    password: string,
    email: string,
    isConfirmed: boolean
  ): Promise<string> {
    const passwordSalt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, passwordSalt);
    const result = await this.dataSource.query(
      `INSERT INTO "Users" (login, hash, email, "createdAt","passwordRecoveryCode","passwordRecoveryExpirationDate","passwordRecoveryIsConfirmed", "emailConfirmationCode", "emailExpirationDate", "emailIsConfirmed", "isBanned", "banDate", "banReason") 
             VALUES ($1, $2,$3, now(), NULL, NULL, true, uuid_generate_v4 (), now() + interval '1 hour', $4, false, NULL, NULL) RETURNING id;`,
      [login, hash, email, isConfirmed]
    );
    return result[0].id.toString();
  }
  async getById(id: DbId): Promise<UserDocument> {
    return this.usersModel.findById(id);
  }
  async getByUniqueField(uniqueField: string): Promise<UserDocument> {
    return this.usersModel
      .findOne()
      .or([
        { email: uniqueField },
        { login: uniqueField },
        { 'emailConfirmation.confirmationCode': uniqueField },
        { 'passwordRecoveryConfirmation.passwordRecoveryCode': uniqueField }
      ]);
  }
  async save(user: UserDocument): Promise<UserDocument> {
    return await user.save();
  }
  async delete(id: DbId): Promise<UserDocument> {
    return this.usersModel.findByIdAndDelete(id);
  }
}
