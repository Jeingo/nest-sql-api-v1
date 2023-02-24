import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { LikeStatus } from '../../../global-types/global.types';
import { getUpdatedLike } from '../../../helper/query/post.like.repository.helper';

export type PostDocument = HydratedDocument<Post>;

type StaticPostMethods = {
  make: (
    this: IPostModel,
    title: string,
    description: string,
    content: string,
    blogId: string,
    blogName: string,
    userId: string
  ) => PostDocument;
};

export type IPostModel = Model<PostDocument> & StaticPostMethods;

@Schema({ _id: false })
class ExtendedLikesInfo {
  @Prop({ required: true })
  likesCount: number;

  @Prop({ required: true })
  dislikesCount: number;
}

@Schema({ _id: false })
class PostOwnerInfo {
  @Prop({ required: true, maxlength: 50 })
  userId: string;

  @Prop({ required: true })
  isBanned: boolean;
}

@Schema()
export class Post {
  @Prop({ required: true, maxlength: 30 })
  title: string;

  @Prop({ required: true, maxlength: 100 })
  shortDescription: string;

  @Prop({ required: true, maxlength: 1000 })
  content: string;

  @Prop({ required: true })
  blogId: string;

  @Prop({ required: true })
  blogName: string;

  @Prop({ required: true })
  createdAt: string;

  @Prop({ required: true })
  extendedLikesInfo: ExtendedLikesInfo;

  @Prop({ required: true })
  postOwnerInfo: PostOwnerInfo;

  @Prop({ required: true })
  blogIsBanned: boolean;

  update: (
    title: string,
    description: string,
    content: string,
    blogId: string,
    blogName: string
  ) => boolean;
  updateLike: (lastStatus: LikeStatus, newStatus: LikeStatus) => boolean;
  ban: (isBanned: boolean) => boolean;
  banFromBlog: (isBanned: boolean) => boolean;
  changeLikesCount: (statusLike: LikeStatus, isBanned: boolean) => boolean;
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.statics.make = function (
  this: IPostModel,
  title: string,
  description: string,
  content: string,
  blogId: string,
  blogName: string,
  userId: string
): PostDocument {
  return new this({
    title: title,
    shortDescription: description,
    content: content,
    blogId: blogId,
    blogName: blogName,
    createdAt: new Date().toISOString(),
    extendedLikesInfo: {
      likesCount: 0,
      dislikesCount: 0
    },
    postOwnerInfo: {
      userId: userId,
      isBanned: false
    },
    blogIsBanned: false
  });
};

PostSchema.methods.update = function (
  title: string,
  description: string,
  content: string,
  blogId: string,
  blogName: string
): boolean {
  this.title = title;
  this.shortDescription = description;
  this.content = content;
  this.blogId = blogId;
  this.blogName = blogName;
  return true;
};

PostSchema.methods.updateLike = function (
  lastStatus: LikeStatus,
  newStatus: LikeStatus
): boolean {
  const newLikesInfo = getUpdatedLike(
    {
      likesCount: this.extendedLikesInfo.likesCount,
      dislikesCount: this.extendedLikesInfo.dislikesCount
    },
    lastStatus,
    newStatus
  );
  this.extendedLikesInfo.likesCount = newLikesInfo.likesCount;
  this.extendedLikesInfo.dislikesCount = newLikesInfo.dislikesCount;
  return true;
};

PostSchema.methods.ban = function (isBanned: boolean): boolean {
  this.postOwnerInfo.isBanned = isBanned;
  return true;
};

PostSchema.methods.changeLikesCount = function (
  statusLike: LikeStatus,
  isBanned: boolean
): boolean {
  if (isBanned) {
    if (statusLike === LikeStatus.Like) {
      this.extendedLikesInfo.likesCount--;
    }
    if (statusLike === LikeStatus.DisLike) {
      this.extendedLikesInfo.dislikesCount--;
    }
  } else {
    if (statusLike === LikeStatus.Like) {
      this.extendedLikesInfo.likesCount++;
    }
    if (statusLike === LikeStatus.DisLike) {
      this.extendedLikesInfo.dislikesCount++;
    }
  }

  return true;
};

PostSchema.methods.banFromBlog = function (isBanned: boolean): boolean {
  this.blogIsBanned = isBanned;
  return true;
};
