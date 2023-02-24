import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IPostModel, Post, PostDocument } from '../domain/entities/post.entity';
import {
  CurrentUserType,
  DbId,
  Direction,
  LikeStatus,
  PaginatedType
} from '../../global-types/global.types';
import { OutputPostDto } from '../api/dto/output.post.dto';
import { NewestLikesType, QueryPosts } from '../api/types/query.posts.type';
import {
  bannedFilter,
  getPaginatedType,
  makeDirectionToNumber
} from '../../helper/query/query.repository.helper';
import { Blog, IBlogModel } from '../../blogs/domain/entities/blog.entity';
import {
  IPostLikeModel,
  PostLike,
  PostLikeDocument
} from '../../post-likes/domain/entities/post.like.entity';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private postsModel: IPostModel,
    @InjectModel(Blog.name) private blogsModel: IBlogModel,
    @InjectModel(PostLike.name) private postLikesModel: IPostLikeModel
  ) {}

  async getAll(
    query: QueryPosts,
    user?: CurrentUserType
  ): Promise<PaginatedType<OutputPostDto>> {
    const {
      sortBy = 'createdAt',
      sortDirection = Direction.DESC,
      pageNumber = 1,
      pageSize = 10
    } = query;
    const sortDirectionNumber = makeDirectionToNumber(sortDirection);
    const skipNumber = (+pageNumber - 1) * +pageSize;

    const finalFilter = {
      ...bannedFilter('postOwnerInfo.isBanned'),
      ...bannedFilter('blogIsBanned')
    };
    const countAllDocuments = await this.postsModel.countDocuments(finalFilter);
    const result = await this.postsModel
      .find(finalFilter)
      .sort({ [sortBy]: sortDirectionNumber })
      .skip(skipNumber)
      .limit(+pageSize);
    const mappedPost = result.map(this._getOutputPostDto);
    const mappedPostWithStatusLike = await this._setStatusLike(
      mappedPost,
      user?.userId
    );
    const mappedFinishPost = await this._setThreeLastUser(
      mappedPostWithStatusLike
    );
    return getPaginatedType(
      mappedFinishPost,
      +pageSize,
      +pageNumber,
      countAllDocuments
    );
  }
  async getAllByBlogId(
    query: QueryPosts,
    blogId: DbId,
    user?: CurrentUserType
  ): Promise<PaginatedType<OutputPostDto>> {
    const blog = await this.blogsModel.findById(blogId);
    if (!blog) throw new NotFoundException();
    const {
      sortBy = 'createdAt',
      sortDirection = Direction.DESC,
      pageNumber = 1,
      pageSize = 10
    } = query;
    const sortDirectionNumber = makeDirectionToNumber(sortDirection);
    const skipNumber = (+pageNumber - 1) * +pageSize;

    const finalFilter = {
      ...bannedFilter('postOwnerInfo.isBanned'),
      ...bannedFilter('blogIsBanned'),
      blogId: blogId.toString()
    };
    const countAllDocuments = await this.postsModel.countDocuments(finalFilter);
    const result = await this.postsModel
      .find(finalFilter)
      .sort({ [sortBy]: sortDirectionNumber })
      .skip(skipNumber)
      .limit(+pageSize);
    const mappedPost = result.map(this._getOutputPostDto);
    const mappedPostWithStatusLike = await this._setStatusLike(
      mappedPost,
      user?.userId
    );
    const mappedFinishPost = await this._setThreeLastUser(
      mappedPostWithStatusLike
    );
    return getPaginatedType(
      mappedFinishPost,
      +pageSize,
      +pageNumber,
      countAllDocuments
    );
  }
  async getById(id: DbId, user?: CurrentUserType): Promise<OutputPostDto> {
    const result = await this.postsModel.findById(id);
    if (!result) throw new NotFoundException();
    if (result.postOwnerInfo.isBanned || result.blogIsBanned)
      throw new NotFoundException();
    const mappedResult = this._getOutputPostDto(result);
    if (user && mappedResult) {
      const like = await this.postLikesModel.findOne({
        userId: user.userId,
        postId: mappedResult.id,
        isBanned: false
      });
      if (like) {
        mappedResult.extendedLikesInfo.myStatus = like.myStatus;
      }
    }
    if (mappedResult) {
      const lastThreeLikes = await this._getLastThreeLikes(mappedResult.id);
      if (lastThreeLikes) {
        mappedResult.extendedLikesInfo.newestLikes = lastThreeLikes;
      }
    }
    return mappedResult;
  }
  private _getOutputPostDto(post: PostDocument): OutputPostDto {
    return {
      id: post._id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: post.extendedLikesInfo.likesCount,
        dislikesCount: post.extendedLikesInfo.dislikesCount,
        myStatus: LikeStatus.None,
        newestLikes: []
      }
    };
  }
  private async _setStatusLike(posts: Array<OutputPostDto>, userId: string) {
    if (!userId) return posts;
    for (let i = 0; i < posts.length; i++) {
      const like = await this.postLikesModel.findOne({
        userId: userId,
        postId: posts[i].id,
        isBanned: false
      });
      if (like) {
        posts[i].extendedLikesInfo.myStatus = like.myStatus;
      }
    }
    return posts;
  }
  private async _setThreeLastUser(posts: Array<OutputPostDto>) {
    for (let i = 0; i < posts.length; i++) {
      const lastThreeLikes = await this._getLastThreeLikes(posts[i].id);
      if (lastThreeLikes) {
        posts[i].extendedLikesInfo.newestLikes = lastThreeLikes;
      }
    }
    return posts;
  }
  private async _getLastThreeLikes(
    postId: string
  ): Promise<NewestLikesType[] | null> {
    const desc = -1;
    const threeLastUser = 3;
    const likeStatus = LikeStatus.Like;
    const result = await this.postLikesModel
      .find({
        postId: postId,
        myStatus: likeStatus,
        isBanned: false
      })
      .sort({ addedAt: desc })
      .limit(threeLastUser);

    if (!result) return null;
    return result.map(this._getOutputExtendedLike);
  }
  private _getOutputExtendedLike(like: PostLikeDocument): NewestLikesType {
    return {
      addedAt: like.addedAt,
      userId: like.userId,
      login: like.login
    };
  }
}
