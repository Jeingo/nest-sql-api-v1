import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CurrentUserType,
  DbId,
  Direction,
  LikeStatus,
  PaginatedType,
  SqlDbId
} from '../../global-types/global.types';
import { OutputCommentDto } from '../api/dto/output.comment.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  CommentDocument,
  ICommentModel
} from '../domain/entities/comment.entity';
import { QueryComments } from '../api/types/query.comments.type';
import {
  bannedFilter,
  getPaginatedType,
  makeDirectionToNumber
} from '../../helper/query/query.repository.helper';
import { IPostModel, Post } from '../../posts/domain/entities/post.entity';
import {
  CommentLike,
  ICommentLikeModel
} from '../../comment-likes/domain/entities/comment.like.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CommentsSqlType } from '../../type-for-sql-entity/comments.sql.type';

@Injectable()
export class SqlCommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private commentsModel: ICommentModel,
    @InjectModel(Post.name) private postsModel: IPostModel,
    @InjectModel(CommentLike.name) private commentLikesModel: ICommentLikeModel,
    @InjectDataSource() protected readonly dataSource: DataSource
  ) {}

  async getAllByPostId(
    query: QueryComments,
    postId: DbId,
    user?: CurrentUserType
  ): Promise<PaginatedType<OutputCommentDto>> {
    const post = await this.postsModel.findById(postId);
    if (!post) throw new NotFoundException();
    const {
      sortBy = 'createdAt',
      sortDirection = Direction.DESC,
      pageNumber = 1,
      pageSize = 10
    } = query;
    const sortDirectionNumber = makeDirectionToNumber(sortDirection);
    const skipNumber = (+pageNumber - 1) * +pageSize;

    const finalFilter = {
      ...bannedFilter('commentatorInfo.isBanned'),
      postId: postId.toString()
    };
    const countAllDocuments = await this.commentsModel.countDocuments(
      finalFilter
    );
    const result = await this.commentsModel
      .find(finalFilter)
      .sort({ [sortBy]: sortDirectionNumber })
      .skip(skipNumber)
      .limit(+pageSize);
    const mappedComments = result.map(this._getOutputComment);
    const mappedCommentsWithStatusLike = await this._setStatusLike(
      mappedComments,
      user?.userId
    );
    return getPaginatedType(
      mappedCommentsWithStatusLike,
      +pageSize,
      +pageNumber,
      countAllDocuments
    );
  }
  async getById(
    id: SqlDbId,
    user?: CurrentUserType
  ): Promise<OutputCommentDto> {
    const result = await this.dataSource.query(
      `SELECT c.*, u."isBanned" AS "ownerIsBanned", u.login FROM "Comments" c LEFT JOIN "Users" u ON c."userId"=u.id WHERE c.id=${id}`
    );
    if (!result[0]) throw new NotFoundException();
    if (result[0].ownerIsBanned) throw new NotFoundException();
    const mappedResult = this.sqlGetOutputComment(result[0]);
    return mappedResult;

    //todo after like
    //
    // if (user?.userId && mappedResult) {
    //   const like = await this.commentLikesModel.findOne({
    //     userId: user.userId,
    //     commentId: mappedResult.id,
    //     isBanned: false
    //   });
    //   if (like) {
    //     mappedResult.likesInfo.myStatus = like.myStatus;
    //   }
    // }
  }
  private sqlGetOutputComment(
    comment: CommentsSqlType & { login: string }
  ): OutputCommentDto {
    return {
      id: comment.id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.userId.toString(),
        userLogin: comment.login
      },
      createdAt: comment.createdAt.toISOString(),
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.None
      }
    };
  }
  private _getOutputComment(comment: CommentDocument): OutputCommentDto {
    return {
      id: comment._id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: comment.likesInfo.likesCount,
        dislikesCount: comment.likesInfo.dislikesCount,
        myStatus: LikeStatus.None
      }
    };
  }
  private async _setStatusLike(
    comments: Array<OutputCommentDto>,
    userId: string
  ) {
    if (!userId) return comments;
    for (let i = 0; i < comments.length; i++) {
      const like = await this.commentLikesModel.findOne({
        userId: userId,
        commentId: comments[i].id
      });
      if (like) {
        comments[i].likesInfo.myStatus = like.myStatus;
      }
    }
    return comments;
  }
}
