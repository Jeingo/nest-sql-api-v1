import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { LikeStatus } from '../../../global-types/global.types';

export type PostLikeDocument = HydratedDocument<PostLike>;

type StaticPostLikeMethods = {
  make: (
    this: IPostLikeModel,
    userId: string,
    postId: string,
    myStatus: LikeStatus,
    login: string
  ) => PostLikeDocument;
};

export type IPostLikeModel = Model<PostLikeDocument> & StaticPostLikeMethods;

@Schema()
export class PostLike {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  isBanned: boolean;

  @Prop({ required: true })
  postId: string;

  @Prop({ required: true })
  myStatus: LikeStatus;

  @Prop({ required: true })
  login: string;

  @Prop({ required: true })
  addedAt: string;

  update: (myStatus: LikeStatus) => boolean;
  ban: (isBanned: boolean) => boolean;
}

export const PostLikeSchema = SchemaFactory.createForClass(PostLike);

PostLikeSchema.statics.make = function (
  this: IPostLikeModel,
  userId: string,
  postId: string,
  myStatus: LikeStatus,
  login: string
): PostLikeDocument {
  return new this({
    userId: userId,
    isBanned: false,
    postId: postId,
    myStatus: myStatus,
    login: login,
    addedAt: new Date().toISOString()
  });
};

PostLikeSchema.methods.update = function (myStatus: LikeStatus): boolean {
  this.myStatus = myStatus;
  return true;
};

PostLikeSchema.methods.ban = function (isBanned: boolean): boolean {
  this.isBanned = isBanned;
  return true;
};
