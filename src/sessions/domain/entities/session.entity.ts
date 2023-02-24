import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

export type SessionDocument = HydratedDocument<Session>;

type StaticSessionMethods = {
  make: (
    this: ISessionModel,
    issueAt: string,
    deviceId: string,
    deviceName: string,
    ip: string,
    userId: string,
    expireAt: string
  ) => SessionDocument;
};

export type ISessionModel = Model<SessionDocument> & StaticSessionMethods;

@Schema()
export class Session {
  @Prop({ required: true })
  issueAt: string;

  @Prop({ required: true })
  deviceId: string;

  @Prop({ required: true })
  deviceName: string;

  @Prop({ required: true })
  ip: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  expireAt: string;

  update: (issueAt: string, expireAt: string) => boolean;
}

export const SessionSchema = SchemaFactory.createForClass(Session);

SessionSchema.statics.make = function (
  this: ISessionModel,
  issueAt: string,
  deviceId: string,
  deviceName: string,
  ip: string,
  userId: string,
  expireAt: string
): SessionDocument {
  deviceName = deviceName ? deviceName : 'some device';
  return new this({
    issueAt: issueAt,
    deviceId: deviceId,
    deviceName: deviceName,
    ip: ip,
    userId: userId,
    expireAt: expireAt
  });
};

SessionSchema.methods.update = function (
  issueAt: string,
  expireAt: string
): boolean {
  this.issueAt = issueAt;
  this.expireAt = expireAt;
  return true;
};
