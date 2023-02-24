import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IPostModel, Post, PostDocument } from '../domain/entities/post.entity';
import { DbId } from '../../global-types/global.types';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private postsModel: IPostModel) {}

  create(
    title: string,
    description: string,
    content: string,
    blogId: string,
    blogName: string,
    userId: string
  ): PostDocument {
    return this.postsModel.make(
      title,
      description,
      content,
      blogId,
      blogName,
      userId
    );
  }
  async getById(id: DbId): Promise<PostDocument> {
    return this.postsModel.findById(id);
  }
  async getByUserId(userId: string): Promise<PostDocument[]> {
    return this.postsModel.find({ 'postOwnerInfo.userId': userId });
  }
  async getByBlogId(blogId: string): Promise<PostDocument[]> {
    return this.postsModel.find({ blogId: blogId });
  }
  async save(post: PostDocument): Promise<PostDocument> {
    return await post.save();
  }
  async delete(id: DbId): Promise<PostDocument> {
    return this.postsModel.findByIdAndDelete(id);
  }
}
