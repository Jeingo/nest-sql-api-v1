import { Injectable } from '@nestjs/common';
import { OutputSessionDto } from '../api/dto/output.session.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class SqlSessionsQueryRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}
  async findAllActiveSession(
    userId: string
  ): Promise<OutputSessionDto[] | null> {
    const result = await this.dataSource.query(
      `SELECT * FROM "Session" WHERE "userId"=${userId} AND "expireAt" > to_timestamp(${
        Date.now() / 1000.0
      })`
    );
    if (!result[0]) return null;
    return result.map(this._getOutputSession);
  }
  private _getOutputSession(session: any): OutputSessionDto {
    return {
      ip: session.ip,
      title: session.deviceName,
      lastActiveDate: session.issueAt,
      deviceId: session.deviceId
    };
  }
}
