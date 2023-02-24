import { Injectable } from '@nestjs/common';
import {
  CurrentUserType,
  Direction,
  LikeStatus,
  PaginatedType
} from '../../../global-types/global.types';
import {
  bannedFilter,
  getPaginatedType,
  makeDirectionToNumber
} from '../../../helper/query/query.repository.helper';
import { QueryComments } from '../../../comments/api/types/query.comments.type';
import { OutputBloggerCommentsDto } from '../api/dto/output.blogger.comments.dto';
import { InjectModel } from '@nestjs/mongoose';
import { IPostModel, Post } from '../../../posts/domain/entities/post.entity';
import {
  Comment,
  CommentDocument,
  ICommentModel
} from '../../../comments/domain/entities/comment.entity';
import { Types } from 'mongoose';

@Injectable()
export class BloggerCommentsQueryRepository {
  constructor(
    @InjectModel(Post.name) protected postsModel: IPostModel,
    @InjectModel(Comment.name) protected commentsModel: ICommentModel
  ) {}

  async getAllForBlogger(
    query: QueryComments,
    user: CurrentUserType
  ): Promise<PaginatedType<OutputBloggerCommentsDto>> {
    const {
      sortBy = 'createdAt',
      sortDirection = Direction.DESC,
      pageNumber = 1,
      pageSize = 10
    } = query;

    const sortDirectionNumber = makeDirectionToNumber(sortDirection);
    const skipNumber = (+pageNumber - 1) * +pageSize;

    const finishFilter = {
      bloggerId: user.userId,
      ...bannedFilter('commentatorInfo.isBanned')
    };

    const countAllDocuments = await this.commentsModel.countDocuments(
      finishFilter
    );

    const result = await this.commentsModel
      .find(finishFilter)
      .sort({ [sortBy]: sortDirectionNumber })
      .skip(skipNumber)
      .limit(+pageSize);

    const mappedResult = result.map(this._getOutputBloggerCommentsDto);
    const finishMappedResult = await this._setPostInfo(mappedResult);

    return getPaginatedType(
      finishMappedResult,
      +pageSize,
      +pageNumber,
      countAllDocuments
    );
  }
  protected _getOutputBloggerCommentsDto(
    comment: CommentDocument
  ): OutputBloggerCommentsDto {
    return {
      id: comment._id.toString(),
      content: comment.content,
      createdAt: comment.createdAt,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin
      },
      likesInfo: {
        likesCount: comment.likesInfo.likesCount,
        dislikesCount: comment.likesInfo.dislikesCount,
        myStatus: LikeStatus.None
      },
      postInfo: {
        id: comment.postId,
        title: null,
        blogId: null,
        blogName: null
      }
    };
  }
  private async _setPostInfo(
    bloggerComments: OutputBloggerCommentsDto[]
  ): Promise<OutputBloggerCommentsDto[]> {
    for (let i = 0; i < bloggerComments.length; i++) {
      const post = await this.postsModel.findById(
        new Types.ObjectId(bloggerComments[i].postInfo.id)
      );
      bloggerComments[i].postInfo.title = post.title;
      bloggerComments[i].postInfo.blogId = post.blogId;
      bloggerComments[i].postInfo.blogName = post.blogName;
    }
    return bloggerComments;
  }
}
