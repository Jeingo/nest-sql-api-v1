import { Injectable, NotFoundException } from '@nestjs/common';
import { OutputUserMeDto } from '../api/dto/output.user.me.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class SqlUsersQueryRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async getMeById(id: string): Promise<OutputUserMeDto> {
    const result = await this.dataSource.query(
      `SELECT * FROM "Users" WHERE id=$1;`,
      [id]
    );
    if (!result[0]) throw new NotFoundException();
    return this._getOutputMeUser(result[0]);
  }
  private _getOutputMeUser(user: any): OutputUserMeDto {
    return {
      email: user.email,
      login: user.login,
      userId: user.id.toString()
    };
  }
}
