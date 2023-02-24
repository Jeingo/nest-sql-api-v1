import { Injectable } from '@nestjs/common';
import {
  ISessionModel,
  Session,
  SessionDocument
} from '../domain/entities/session.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class SessionsRepository {
  constructor(
    @InjectModel(Session.name) private sessionsModel: ISessionModel
  ) {}
  create(
    issueAt: string,
    deviceId: string,
    deviceName: string,
    ip: string,
    userId: string,
    expireAt: string
  ): SessionDocument {
    return this.sessionsModel.make(
      issueAt,
      deviceId,
      deviceName,
      ip,
      userId,
      expireAt
    );
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
