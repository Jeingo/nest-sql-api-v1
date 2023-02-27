import { Injectable } from '@nestjs/common';
import {
  ISessionModel,
  Session,
  SessionDocument
} from '../domain/entities/session.entity';
import { InjectModel } from '@nestjs/mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

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
  ): Promise<string> {
    deviceName = deviceName ? deviceName : 'some device';

    const result = await this.dataSource.query(
      `INSERT INTO "Session" ("issueAt", "deviceId", "deviceName", ip, "userId", "expireAt") 
             VALUES ( to_timestamp(${
               new Date(issueAt).getTime() / 1000.0
             }),$1, $2, $3, $4, to_timestamp(${
        new Date(expireAt).getTime() / 1000
      })) RETURNING id;`,
      [deviceId, deviceName, ip, userId.toString()]
    );
    return result[0].id.toString();
  }

  async save(session: SessionDocument): Promise<SessionDocument> {
    return session.save();
  }
  async get(deviceId: string): Promise<any> {
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
             SET "issueAt"=to_timestamp(${
               new Date(issueAt).getTime() / 1000.0
             }),
             "expireAt"=to_timestamp(${new Date(expireAt).getTime() / 1000.0})
             WHERE "deviceId"='${deviceId}'`
    );
    return !!result[0];
  }
  async deleteSession(issueAt: number): Promise<boolean> {
    const result = await this.dataSource.query(
      `DELETE FROM "Session" WHERE "issueAt"=to_timestamp(${
        new Date(issueAt).getTime() / 1000.0
      })`
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
      `DELETE FROM "Session" WHERE "userId"=${userId} AND "issueAt" <> to_timestamp(${
        new Date(issueAt).getTime() / 1000.0
      })`
    );
    return !!result[1];
  }
  async isActive(deviceId: string, issueAt: number): Promise<boolean> {
    const result = await this.dataSource.query(
      `SELECT * FROM "Session" WHERE "deviceId"='${deviceId}' AND "issueAt"=to_timestamp(${
        new Date(issueAt).getTime() / 1000.0
      })`
    );
    console.log(result);
    return result[0];
  }

  async deleteByUserId(userId: string): Promise<boolean> {
    const result = await this.sessionsModel.deleteMany({ userId: userId });
    return !!result;
  }
}
