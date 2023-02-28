export type SessionSqlType = {
  id: number;
  issueAt: Date;
  expireAt: Date;
  deviceId: string;
  deviceName: string;
  ip: string;
  userId: number;
};
