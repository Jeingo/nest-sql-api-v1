import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../domain/users.entity';
import { SqlDbId } from '../../global-types/global.types';
import { v4 } from 'uuid';

@Injectable()
export class UsersRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async create(
    login: string,
    password: string,
    email: string,
    isConfirmed: boolean
  ): Promise<User> {
    const passwordSalt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, passwordSalt);

    const result = await this.dataSource.query(
      `INSERT INTO "Users" 
             (login, hash, email, "createdAt","passwordRecoveryCode",
             "passwordRecoveryExpirationDate","passwordRecoveryIsConfirmed",
             "emailConfirmationCode", "emailExpirationDate", "emailIsConfirmed",
             "isBanned", "banDate", "banReason") 
             VALUES
             ('${login}', '${hash}','${email}', now(), NULL, NULL, true, '${v4()}', now() + interval '1 hour', ${isConfirmed}, false, NULL, NULL) RETURNING *;`
    );
    return result[0];
  }
  async getById(id: SqlDbId): Promise<User> {
    const result = await this.dataSource.query(
      `SELECT * FROM "Users" WHERE id=$1;`,
      [id]
    );
    return result[0];
  }

  async updateConfirmationCode(email: string): Promise<User> {
    const queryString = `UPDATE "Users"
                         SET "emailConfirmationCode"='${v4()}'
                         WHERE email='${email}' RETURNING *`;

    const result = await this.dataSource.query(queryString);

    return result[0][0];
  }
  async updatePassword(
    recoveryCode: string,
    newPassword: string
  ): Promise<boolean> {
    const passwordSalt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(newPassword, passwordSalt);
    const queryString = `UPDATE "Users"
                         SET "passwordRecoveryIsConfirmed"=true,
                         hash='${hash}'
                         WHERE "passwordRecoveryCode"='${recoveryCode}';`;

    const result = await this.dataSource.query(queryString);

    return !!result[0];
  }
  async getByLoginOrEmail(uniqueField: string): Promise<User> {
    const queryString = `SELECT * FROM "Users"
                         WHERE login='${uniqueField}'
                         OR email='${uniqueField}'`;

    const result = await this.dataSource.query(queryString);

    return result[0];
  }
  async getByUUIDCode(code: string): Promise<User> {
    const queryString = `SELECT * FROM "Users"
                         WHERE "passwordRecoveryCode"='${code}'
                         OR "emailConfirmationCode"='${code}'`;

    const result = await this.dataSource.query(queryString);

    return result[0];
  }
  async updateConfirmationEmail(code: string): Promise<boolean> {
    const queryString = `UPDATE "Users"
                         SET "emailIsConfirmed"=true
                         WHERE "emailConfirmationCode"='${code}'`;

    const result = await this.dataSource.query(queryString);

    return !!result[0];
  }
  async updatePasswordRecoveryConfirmationCode(email: string): Promise<User> {
    const queryString = `UPDATE "Users"
                         SET "passwordRecoveryCode"='${v4()}',
                         "passwordRecoveryIsConfirmed"=false,
                         "passwordRecoveryExpirationDate"=now() + interval '1 hour'
                         WHERE email='${email}' RETURNING *`;

    const result = await this.dataSource.query(queryString);

    return result[0][0];
  }
  async delete(id: SqlDbId): Promise<boolean> {
    const result = await this.dataSource.query(
      `DELETE FROM "Users" WHERE id=${id}`
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
               WHERE id=${userId}`
      );
      return !!result[1];
    }
    const result = await this.dataSource.query(
      `UPDATE "Users"
               SET "isBanned"=false,
               "banDate"=NULL,
               "banReason"=NULL
               WHERE id=${userId}`
    );
    return !!result[1];
  }
}
