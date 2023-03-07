import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './users.sql.type';

export type SessionSqlType = {
  id: number;
  issueAt: Date;
  expireAt: Date;
  deviceId: string;
  deviceName: string;
  ip: string;
  userId: number;
};

@Entity('Session')
export class Session {
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

  @ManyToOne(() => User, (user) => user.sessions)
  user: User;
}
