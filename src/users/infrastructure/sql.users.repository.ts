import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IUserModel, User } from '../domain/entities/user.entity';
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
  // async getById(id: DbId): Promise<UserDocument> {
  //   return this.usersModel.findById(id);
  // }
  //
  // OR email=${uniqueField}
  //   AND "passwordRecoveryCode"=${uniqueField}
  //   AND "emailConfirmationCode"=929e1d89-d430-457f-896d-97ed7cafce9c

  async getByLoginOrEmail(uniqueField: string): Promise<any> {
    const queryString = `SELECT * FROM "Users"
                         WHERE login='${uniqueField}'
                         OR email='${uniqueField}'`;

    const result = await this.dataSource.query(queryString);

    return result[0];
  }
  async getByUUIDCode(code: string): Promise<any> {
    const queryString = `SELECT * FROM "Users"
                         WHERE "passwordRecoveryCode"='${code}'
                         OR "emailConfirmationCode"='${code}'`;

    const result = await this.dataSource.query(queryString);

    return result[0];
  }
  async delete(id: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `DELETE FROM "Users" WHERE id=$1`,
      [id]
    );
    return !!result[1];
  }
  async banUser(
    isBanned: boolean,
    banReason: string,
    userId: string
  ): Promise<boolean> {
    if (isBanned) {
      const result = await this.dataSource.query(
        `UPDATE "Users"
               SET "isBanned"=true,
               "banDate"=now(),
               "banReason"='${banReason}'
               WHERE id=$1`,
        [userId]
      );
      return !!result[1];
    }
    const result = await this.dataSource.query(
      `UPDATE "Users"
               SET "isBanned"=false,
               "banDate"=NULL,
               "banReason"=NULL
               WHERE id=$1`,
      [userId]
    );
    return !!result[1];
  }
}
