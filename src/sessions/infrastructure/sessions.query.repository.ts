import { Injectable } from '@nestjs/common';
import { OutputSessionDto } from '../api/dto/output.session.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  ISessionModel,
  Session,
  SessionDocument
} from '../domain/entities/session.entity';

@Injectable()
export class SessionsQueryRepository {
  constructor(
    @InjectModel(Session.name) private sessionsModel: ISessionModel
  ) {}
  async findAllActiveSession(
    userId: string
  ): Promise<OutputSessionDto[] | null> {
    const currentDate = new Date().toISOString();
    const result = await this.sessionsModel.find({
      userId: userId,
      expireAt: { $gt: currentDate }
    });
    if (!result) return null;
    return result.map(this._getOutputSession);
  }
  private _getOutputSession(session: SessionDocument): OutputSessionDto {
    return {
      ip: session.ip,
      title: session.deviceName,
      lastActiveDate: session.issueAt,
      deviceId: session.deviceId
    };
  }
}
