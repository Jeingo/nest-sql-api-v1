import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { v4 } from 'uuid';
import { add } from 'date-fns';

export type UserDocument = HydratedDocument<User>;

type StaticUserMethods = {
  make: (
    this: IUserModel,
    login: string,
    password: string,
    email: string,
    isConfirmed: boolean
  ) => UserDocument;
};

export type IUserModel = Model<UserDocument> & StaticUserMethods;

@Schema({ _id: false })
class PasswordRecoveryConfirmation {
  @Prop()
  passwordRecoveryCode: string;

  @Prop()
  expirationDate: Date;

  @Prop({ required: true })
  isConfirmed: boolean;
}

@Schema({ _id: false })
class EmailConfirmation {
  @Prop({ required: true })
  confirmationCode: string;

  @Prop({ required: true })
  expirationDate: Date;

  @Prop({ required: true })
  isConfirmed: boolean;
}

@Schema({ _id: false })
class BanInfo {
  @Prop({ required: true })
  isBanned: boolean;

  @Prop()
  banDate: string;

  @Prop({ minlength: 20, maxlength: 100 })
  banReason: string;
}

@Schema({ _id: false })
class BloggerBanInfo {
  @Prop()
  banDate: string;

  @Prop({ minlength: 20 })
  banReason: string;

  @Prop()
  blogId: string;
}

@Schema()
export class User {
  @Prop({ required: true, maxlength: 10, minlength: 3 })
  login: string;

  @Prop({ required: true })
  hash: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  createdAt: string;

  @Prop({ required: true })
  passwordRecoveryConfirmation: PasswordRecoveryConfirmation;

  @Prop({ required: true })
  emailConfirmation: EmailConfirmation;

  @Prop({ required: true })
  banInfo: BanInfo;

  @Prop({ required: true })
  bloggerBanInfo: Array<BloggerBanInfo>;

  updateEmailConfirmationStatus: () => boolean;
  updateConfirmationCode: () => boolean;
  updatePasswordRecoveryConfirmationCode: () => boolean;
  updatePassword: (newPassword: string) => boolean;
  ban: (isBanned: boolean, banReason: string) => boolean;
  bloggerBan: (isBanned: boolean, banReason: string, blogId: string) => boolean;
  checkBanStatusForBlog: (blogId: string) => boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.statics.make = function (
  this: IUserModel,
  login: string,
  password: string,
  email: string,
  isConfirmed: boolean
): UserDocument {
  const passwordSalt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, passwordSalt);
  const newDate = new Date();
  return new this({
    login: login,
    hash: passwordHash,
    email: email,
    createdAt: newDate.toISOString(),
    passwordRecoveryConfirmation: {
      passwordRecoveryCode: null,
      expirationDate: null,
      isConfirmed: true
    },
    emailConfirmation: {
      confirmationCode: v4(),
      expirationDate: add(newDate, {
        hours: 1
      }),
      isConfirmed: isConfirmed
    },
    banInfo: {
      isBanned: false,
      banDate: null,
      banReason: null
    },
    bloggerBanInfo: []
  });
};

UserSchema.methods.updateEmailConfirmationStatus = function (): boolean {
  this.emailConfirmation.isConfirmed = true;
  return true;
};

UserSchema.methods.updateConfirmationCode = function (): boolean {
  this.emailConfirmation.confirmationCode = v4();
  return true;
};

UserSchema.methods.updatePasswordRecoveryConfirmationCode =
  function (): boolean {
    this.passwordRecoveryConfirmation.passwordRecoveryCode = v4();
    this.passwordRecoveryConfirmation.isConfirmed = false;
    this.passwordRecoveryConfirmation.expirationDate = add(new Date(), {
      hours: 1
    });
    return true;
  };

UserSchema.methods.updatePassword = function (newPassword: string): boolean {
  const passwordSalt = bcrypt.genSaltSync(10);
  this.hash = bcrypt.hashSync(newPassword, passwordSalt);
  this.passwordRecoveryConfirmation.isConfirmed = true;
  return true;
};

UserSchema.methods.ban = function (
  isBanned: boolean,
  banReason: string
): boolean {
  if (isBanned) {
    this.banInfo.isBanned = true;
    this.banInfo.banDate = new Date().toISOString();
    this.banInfo.banReason = banReason;
    return true;
  }
  this.banInfo.isBanned = false;
  this.banInfo.banDate = null;
  this.banInfo.banReason = null;
  return true;
};

UserSchema.methods.bloggerBan = function (
  isBanned: boolean,
  banReason: string,
  blogId: string
): boolean {
  if (isBanned) {
    this.bloggerBanInfo.push({
      banDate: new Date().toISOString(),
      banReason: banReason,
      blogId: blogId
    });
    return true;
  }
  this.bloggerBanInfo = this.bloggerBanInfo.filter(
    (banInfo) => banInfo.blogId !== blogId
  );
  return true;
};

UserSchema.methods.checkBanStatusForBlog = function (blogId: string): boolean {
  const result = this.bloggerBanInfo.filter(
    (banInfo) => banInfo.blogId === blogId
  );
  return result.length > 0;
};
