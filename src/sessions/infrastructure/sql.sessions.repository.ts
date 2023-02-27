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
      [deviceId, deviceName, ip, userId]
    );
    return result[0].id.toString();
  }

  async save(session: SessionDocument): Promise<SessionDocument> {
    return session.save();
  }
  async get(deviceId: string): Promise<SessionDocument> {
    return this.sessionsModel.findOne({ deviceId: deviceId });
  }
  async updateSession(
    issueAt: string,
    expireAt: string,
    deviceId: string
  ): Promise<boolean> {
    const result = await this.sessionsModel.findOneAndUpdate(
      { deviceId: deviceId },
      { issueAt: issueAt, expireAt: expireAt }
    );
    return !!result;
  }
  async deleteSession(issueAt: string): Promise<boolean> {
    const result = await this.sessionsModel.findOneAndDelete({
      issueAt: issueAt
    });
    return !!result;
  }
  async deleteSessionsWithoutCurrent(
    userId: string,
    issueAt: string
  ): Promise<boolean> {
    const result = await this.sessionsModel
      .deleteMany({ userId: userId })
      .where('issueAt')
      .ne(issueAt);
    return !!result;
  }
  async deleteByUserId(userId: string): Promise<boolean> {
    const result = await this.sessionsModel.deleteMany({ userId: userId });
    return !!result;
  }
}
