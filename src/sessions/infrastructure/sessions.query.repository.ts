import { Injectable } from '@nestjs/common';
import { OutputSessionDto } from '../api/dto/output.session.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from '../domain/session.entity';

@Injectable()
export class SessionsQueryRepository {
  constructor(
    @InjectRepository(Session) private sessionsRepository: Repository<Session>
  ) {}
  async findAllActiveSession(
    userId: string
  ): Promise<OutputSessionDto[] | null> {
    const result1 = await this.sessionsRepository
      .createQueryBuilder()
      .where(`"userId"=:userId`, { userId: +userId })
      .andWhere(`"expireAt" > to_timestamp(:expireAt)`, {
        expireAt: Date.now() / 1000
      })
      .getMany();
    if (!result1) return null;
    return result1.map(this._getOutputSession);
  }
  private _getOutputSession(session: Session): OutputSessionDto {
    return {
      ip: session.ip,
      title: session.deviceName,
      lastActiveDate: session.issueAt.toISOString(),
      deviceId: session.deviceId
    };
  }
}
