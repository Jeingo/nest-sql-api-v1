import { Injectable } from '@nestjs/common';
import { ISessionModel, Session } from '../domain/entities/session.entity';
import { InjectModel } from '@nestjs/mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SqlDbId } from '../../global-types/global.types';
import { SessionSqlType } from '../../type-for-sql-entity/session.sql.type';

@Injectable()
export class SqlSessionsRepository {
  constructor(
    @InjectModel(Session.name) private sessionsModel: ISessionModel,
    @InjectDataSource() private readonly dataSource: DataSource
  ) {}
  async create(
    issueAt: number,
    deviceId: string,
    deviceName: string,
    ip: string,
    userId: string,
    expireAt: number
  ): Promise<SqlDbId> {
    deviceName = deviceName ? deviceName : 'some device';
    const result = await this.dataSource.query(
      `INSERT INTO "Session" ("issueAt", "deviceId", "deviceName", ip, "userId", "expireAt") 
             VALUES ( to_timestamp(${issueAt}),'${deviceId}', '${deviceName}', '${ip}', '${userId}', to_timestamp(${expireAt})) RETURNING id;`
    );
    return result[0].id.toString();
  }
  async get(deviceId: string): Promise<SessionSqlType> {
    const result = await this.dataSource.query(
      `SELECT * FROM "Session" WHERE "deviceId"='${deviceId}'`
    );
    return result[0];
  }
  async updateSession(
    issueAt: number,
    expireAt: number,
    deviceId: string
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `UPDATE "Session" 
             SET "issueAt"=to_timestamp(${issueAt}),
             "expireAt"=to_timestamp(${expireAt})
             WHERE "deviceId"='${deviceId}'`
    );
    return !!result[0];
  }
  async deleteSession(issueAt: number): Promise<boolean> {
    const result = await this.dataSource.query(
      `DELETE FROM "Session" WHERE "issueAt"=to_timestamp(${issueAt})`
    );
    return !!result[1];
  }
  async deleteSessionByDeviceId(deviceId: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `DELETE FROM "Session" WHERE "deviceId"='${deviceId}';`
    );
    return !!result[1];
  }
  async deleteSessionsWithoutCurrent(
    userId: string,
    issueAt: number
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `DELETE FROM "Session" WHERE "userId"=${userId} AND "issueAt" <> to_timestamp(${issueAt})`
    );
    return !!result[1];
  }
  async isActive(deviceId: string, issueAt: number): Promise<boolean> {
    const result = await this.dataSource.query(
      `SELECT * FROM "Session" WHERE "deviceId"='${deviceId}' AND "issueAt"=to_timestamp(${issueAt})`
    );
    return result[0];
  }

  async deleteByUserId(userId: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `DELETE FROM "Session" WHERE "userId"='${userId}';`
    );
    return !!result[1];
  }
}
