import { Injectable } from '@nestjs/common';
import {
  CurrentUserType,
  Direction,
  LikeStatus,
  PaginatedType
} from '../../../global-types/global.types';
import { getPaginatedType } from '../../../helper/query/query.repository.helper';
import { QueryComments } from '../../../comments/api/types/query.comments.type';
import { OutputBloggerCommentsDto } from '../api/dto/output.blogger.comments.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CommentsSqlType } from '../../../type-for-sql-entity/comments.sql.type';

@Injectable()
export class SqlBloggerCommentsQueryRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

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

    const skipNumber = (+pageNumber - 1) * +pageSize;

    const queryString = `SELECT c.id, c.content, c."createdAt", c."userId", c."postId", u2.login, p.title, b.id AS "blogId", b.name AS "blogName",
                         COUNT(CASE WHEN cl."myStatus" = 'Like' THEN 1 ELSE NULL END) AS "likesCount",
                         COUNT(CASE WHEN cl."myStatus" = 'Dislike' THEN 1 ELSE NULL END) AS "dislikesCount"
                         ${this.getUserStatus(user)}
                         FROM "Comments" c
                         LEFT JOIN "CommentLikes" cl ON c.id = cl."commentId"
                         LEFT JOIN "Users" u2 ON c."userId"=u2.id
                         LEFT JOIN "Posts" p ON c."postId"=p.id 
                         LEFT JOIN "Blogs" b ON p."blogId"=b.id
                         LEFT JOIN "Users" u ON b."userId"=u.id
                         WHERE
                         u.id=${user.userId}
                         AND
                         u2."isBanned"=false
                         GROUP BY
                         c.id, c.content, c."createdAt", c."userId", c."postId", u2.login, p.title, b.id, b.name
                         ORDER BY "${sortBy}" ${sortDirection}
                         LIMIT ${pageSize}
                         OFFSET ${skipNumber}`;

    const queryStringForLength = `SELECT COUNT(c.*) FROM "Comments" c
                                  LEFT JOIN "Users" u2 ON c."userId"=u2.id
                                  LEFT JOIN "Posts" p ON c."postId"=p.id 
                                  LEFT JOIN "Blogs" b ON p."blogId"=b.id
                                  LEFT JOIN "Users" u ON b."userId"=u.id
                                  WHERE
                                  u.id=${user.userId}
                                  AND
                                  u2."isBanned"=false`;

    const result = await this.dataSource.query(queryString);
    const resultCount = await this.dataSource.query(queryStringForLength);

    return getPaginatedType(
      result.map(this._getOutputBloggerCommentsDto),
      +pageSize,
      +pageNumber,
      +resultCount[0].count
    );
  }
  protected _getOutputBloggerCommentsDto(
    comment: CommentsSqlType & {
      login: string;
      title: string;
      blogId: number;
      blogName: string;
      likesCount: string;
      dislikesCount: string;
      likeStatus: string;
      dislikeStatus: string;
    }
  ): OutputBloggerCommentsDto {
    const myStatus = +comment.likeStatus
      ? LikeStatus.Like
      : +comment.dislikeStatus
      ? LikeStatus.DisLike
      : LikeStatus.None;

    return {
      id: comment.id.toString(),
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      commentatorInfo: {
        userId: comment.userId.toString(),
        userLogin: comment.login
      },
      likesInfo: {
        likesCount: +comment.likesCount,
        dislikesCount: +comment.dislikesCount,
        myStatus: myStatus
      },
      postInfo: {
        id: comment.postId.toString(),
        title: comment.title,
        blogId: comment.blogId.toString(),
        blogName: comment.blogName
      }
    };
  }
  getUserStatus(user: CurrentUserType): string {
    if (user) {
      return `, COUNT(CASE WHEN cl."userId" = ${user.userId} AND cl."myStatus" = 'Like' THEN 1 ELSE NULL END )AS "likeStatus",
              COUNT(CASE WHEN cl."userId" = ${user.userId} AND cl."myStatus" = 'Dislike' THEN 1 ELSE NULL END )AS "dislikeStatus"`;
    }
    return ``;
  }
}
