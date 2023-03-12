import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import { User } from '../../users/domain/users.entity';

@Entity('Session')
export class Session extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('timestamptz')
  issueAt: Date;

  @Column('timestamptz')
  expireAt: Date;

  @Column('uuid')
  deviceId: string;

  @Column('varchar')
  deviceName: string;

  @Column('varchar')
  ip: string;

  @Column('integer')
  userId: number;

  @ManyToOne(() => User, (user) => user.sessions)
  user: User;

  update(issueAt: number, expireAt: number): boolean {
    this.issueAt = new Date(issueAt);
    this.expireAt = new Date(expireAt);
    return true;
  }
  isOwner(userId): boolean {
    return this.userId.toString() === userId;
  }
  static make(
    issueAt: number,
    deviceId: string,
    deviceName: string,
    ip: string,
    userId: string,
    expireAt: number
  ): Session {
    const session = new Session();
    deviceName = deviceName ? deviceName : 'some device';
    session.issueAt = new Date(issueAt);
    session.deviceId = deviceId;
    session.deviceName = deviceName;
    session.ip = ip;
    session.userId = +userId;
    session.expireAt = new Date(expireAt);
    return session;
  }
}
