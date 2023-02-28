import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SqlUsersRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async create(
    login: string,
    password: string,
    email: string,
    isConfirmed: boolean
  ): Promise<any> {
    const passwordSalt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, passwordSalt);

    const result = await this.dataSource.query(
      `INSERT INTO "Users" 
             (login, hash, email, "createdAt","passwordRecoveryCode","passwordRecoveryExpirationDate","passwordRecoveryIsConfirmed", "emailConfirmationCode", "emailExpirationDate", "emailIsConfirmed", "isBanned", "banDate", "banReason") 
             VALUES
             ($1, $2,$3, now(), NULL, NULL, true, uuid_generate_v4 (), now() + interval '1 hour', $4, false, NULL, NULL) RETURNING *;`,
      [login, hash, email, isConfirmed]
    );
    return result[0];
  }
  async getById(id: string): Promise<any> {
    const result = await this.dataSource.query(
      `SELECT * FROM "Users" WHERE id=$1;`,
      [id]
    );
    return result[0];
  }

  async updateConfirmationCode(email: string): Promise<any> {
    const queryString = `UPDATE "Users"
                         SET "emailConfirmationCode"=uuid_generate_v4 ()
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
  async updateConfirmationEmail(code: string): Promise<boolean> {
    const queryString = `UPDATE "Users"
                         SET "emailIsConfirmed"=true
                         WHERE "emailConfirmationCode"='${code}'`;

    const result = await this.dataSource.query(queryString);

    return !!result[0];
  }
  async updatePasswordRecoveryConfirmationCode(email: string): Promise<any> {
    const queryString = `UPDATE "Users"
                         SET "passwordRecoveryCode"=uuid_generate_v4 (),
                         "passwordRecoveryIsConfirmed"=false,
                         "passwordRecoveryExpirationDate"=now() + interval '1 hour'
                         WHERE email='${email}' RETURNING *`;

    const result = await this.dataSource.query(queryString);

    return result[0][0];
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
