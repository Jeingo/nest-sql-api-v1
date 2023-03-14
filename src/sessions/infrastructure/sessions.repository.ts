import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from '../domain/session.entity';
import { SqlDbId } from '../../global-types/global.types';

@Injectable()
export class SessionsRepository {
  constructor(
    @InjectRepository(Session) private sessionsRepository: Repository<Session>
  ) {}
  create(
    issueAt: number,
    deviceId: string,
    deviceName: string,
    ip: string,
    userId: string,
    expireAt: number
  ): Session {
    return Session.make(issueAt, deviceId, deviceName, ip, userId, expireAt);
  }
  async save(session: Session): Promise<Session> {
    return await this.sessionsRepository.save(session);
  }
  async getByDeviceId(id: SqlDbId): Promise<Session> {
    return this.sessionsRepository.findOneBy({ deviceId: id });
  }
  async deleteByUserId(userId: string): Promise<boolean> {
    await this.sessionsRepository.delete({ userId: +userId });
    return true;
  }
  async deleteByDeviceId(deviceId: SqlDbId): Promise<boolean> {
    await this.sessionsRepository.delete({ deviceId: deviceId });
    return true;
  }
  async deleteWithoutCurrent(
    userId: string,
    deviceId: string
  ): Promise<boolean> {
    await this.sessionsRepository
      .createQueryBuilder()
      .delete()
      .from(Session)
      .where('userId = :userId AND deviceId <> :deviceId', {
        userId: +userId,
        deviceId: deviceId
      })
      .execute();
    return true;
  }
  async isActive(deviceId: string, issueAt: Date): Promise<boolean> {
    const result = await this.sessionsRepository.findOneBy({
      deviceId: deviceId,
      issueAt: issueAt
    });
    return !!result;
  }
}
