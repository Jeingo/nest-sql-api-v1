import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, IBlogModel } from '../../blogs/domain/entities/blog.entity';
import { IUserModel, User } from '../../users/domain/entities/user.entity';
import { IPostModel, Post } from '../../posts/domain/entities/post.entity';
import {
  Comment,
  ICommentModel
} from '../../comments/domain/entities/comment.entity';
import {
  ISessionModel,
  Session
} from '../../sessions/domain/entities/session.entity';
import {
  IPostLikeModel,
  PostLike
} from '../../post-likes/domain/entities/post.like.entity';
import {
  CommentLike,
  ICommentLikeModel
} from '../../comment-likes/domain/entities/comment.like.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class TestingService {
  constructor(
    @InjectModel(Blog.name) private blogsModel: IBlogModel,
    @InjectModel(User.name) private usersModel: IUserModel,
    @InjectModel(Post.name) private postsModel: IPostModel,
    @InjectModel(Comment.name) private commentsModel: ICommentModel,
    @InjectModel(Session.name) private sessionsModel: ISessionModel,
    @InjectModel(PostLike.name) private postLikesModel: IPostLikeModel,
    @InjectModel(CommentLike.name) private commentLikesModel: ICommentLikeModel,
    @InjectDataSource() private readonly dataSource: DataSource
  ) {}

  async removeAll() {
    await this.blogsModel.deleteMany({});
    await this.usersModel.deleteMany({});
    await this.postsModel.deleteMany({});
    await this.commentsModel.deleteMany({});
    await this.sessionsModel.deleteMany({});
    await this.postLikesModel.deleteMany({});
    await this.commentLikesModel.deleteMany({});
    await this.dataSource.query(`TRUNCATE "Users" CASCADE`);
    await this.dataSource.query(`TRUNCATE "Session" CASCADE`);
    await this.dataSource.query(`TRUNCATE "Blogs" CASCADE`);
    await this.dataSource.query(`TRUNCATE "Posts" CASCADE`);
    await this.dataSource.query(`TRUNCATE "Users_Blogs_Ban" CASCADE`);
    await this.dataSource.query(`TRUNCATE "Comments" CASCADE`);
    await this.dataSource.query(`TRUNCATE "CommentLikes" CASCADE`);
    await this.dataSource.query(`TRUNCATE "PostLikes" CASCADE`);
  }
}
