import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

export type BlogDocument = HydratedDocument<Blog>;

type StaticBlogMethods = {
  make: (
    this: IBlogModel,
    name: string,
    description: string,
    websiteUrl: string,
    userId: string,
    login: string
  ) => BlogDocument;
};

export type IBlogModel = Model<BlogDocument> & StaticBlogMethods;

@Schema({ _id: false })
class BlogOwnerInfo {
  @Prop({ required: true, maxlength: 50 })
  userId: string;

  @Prop({ required: true, maxlength: 50 })
  userLogin: string;

  @Prop({ required: true })
  isBanned: boolean;
}

@Schema()
export class Blog {
  @Prop({ required: true, maxlength: 15 })
  name: string;

  @Prop({ required: true, maxlength: 500 })
  description: string;

  @Prop({ required: true })
  websiteUrl: string;

  @Prop({ required: true, maxlength: 100 })
  createdAt: string;

  @Prop({ required: true })
  isMembership: boolean;

  @Prop({ required: true })
  blogOwnerInfo: BlogOwnerInfo;

  @Prop({ required: true })
  isBanned: boolean;

  @Prop()
  banDate: string;

  update: (name: string, description: string, websiteUrl: string) => boolean;
  ban: (isBanned: boolean) => boolean;
  banBlog: (isBanned: boolean) => boolean;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

BlogSchema.statics.make = function (
  this: IBlogModel,
  name: string,
  description: string,
  websiteUrl: string,
  userId: string,
  login: string
): BlogDocument {
  return new this({
    name: name,
    description: description,
    websiteUrl: websiteUrl,
    createdAt: new Date().toISOString(),
    isMembership: false,
    blogOwnerInfo: {
      userId: userId,
      userLogin: login,
      isBanned: false
    },
    isBanned: false,
    banDate: null
  });
};

BlogSchema.methods.update = function (
  name: string,
  description: string,
  websiteUrl: string
): boolean {
  this.name = name;
  this.description = description;
  this.websiteUrl = websiteUrl;
  return true;
};

BlogSchema.methods.ban = function (isBanned: boolean): boolean {
  this.blogOwnerInfo.isBanned = isBanned;
  return true;
};

BlogSchema.methods.banBlog = function (isBanned: boolean): boolean {
  if (isBanned) {
    this.isBanned = true;
    this.banDate = new Date().toISOString();
    return true;
  }
  this.isBanned = false;
  this.banDate = new Date().toISOString();
  return true;
};
