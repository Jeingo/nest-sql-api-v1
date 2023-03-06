import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CurrentUserType,
  Direction,
  LikeStatus,
  PaginatedType,
  SqlDbId
} from '../../global-types/global.types';
import { OutputCommentDto } from '../api/dto/output.comment.dto';
import { QueryComments } from '../api/types/query.comments.type';
import { getPaginatedType } from '../../helper/query/query.repository.helper';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CommentsSqlType } from '../../type-for-sql-entity/comments.sql.type';

@Injectable()
export class CommentsQueryRepository {
  constructor(@InjectDataSource() protected readonly dataSource: DataSource) {}

  async getAllByPostId(
    query: QueryComments,
    postId: SqlDbId,
    user?: CurrentUserType
  ): Promise<PaginatedType<OutputCommentDto>> {
    const post = await this.dataSource.query(
      `SELECT * FROM "Posts" WHERE id=$1;`,
      [postId]
    );
    if (!post[0]) throw new NotFoundException();
    const {
      sortBy = 'createdAt',
      sortDirection = Direction.DESC,
      pageNumber = 1,
      pageSize = 10
    } = query;

    const skipNumber = (+pageNumber - 1) * +pageSize;

    const queryString = `SELECT
      c.id, c.content, c."createdAt", c."userId", u.login,
      COUNT(CASE WHEN cl."myStatus" = 'Like' AND u2."isBanned"=false THEN 1 ELSE NULL END) AS "likesCount",
      COUNT(CASE WHEN cl."myStatus" = 'Dislike' AND u2."isBanned"=false THEN 1 ELSE NULL END) AS "dislikesCount"
      ${this.getUserStatus(user)}
      FROM
      "Comments" c
      LEFT JOIN "CommentLikes" cl ON c.id = cl."commentId"
      LEFT JOIN "Users" u ON c."userId"=u.id
      LEFT JOIN "Users" u2 ON cl."userId"=u2.id
      WHERE c."postId"=${postId}
      AND u."isBanned"=false
      GROUP BY
      c.id, c.content, c."createdAt", c."userId", u.login
      ORDER BY c."${sortBy}" ${sortDirection}
      LIMIT ${pageSize}
      OFFSET ${skipNumber};`;

    const queryStringForLength = `SELECT COUNT(c.*) FROM "Comments" c
                         LEFT JOIN "Users" u ON c."userId"=u.id
                         WHERE
                         c."postId"=${postId}
                         AND
                         u."isBanned"=false`;

    const result = await this.dataSource.query(queryString);
    const resultCount = await this.dataSource.query(queryStringForLength);

    return getPaginatedType(
      result.map(this.sqlGetOutputComment),
      +pageSize,
      +pageNumber,
      +resultCount[0].count
    );
  }
  async getById(
    id: SqlDbId,
    user?: CurrentUserType
  ): Promise<OutputCommentDto> {
    const queryString = `SELECT
      c.id, c.content, c."createdAt", c."userId", u.login,
      COUNT(CASE WHEN cl."myStatus" = 'Like' AND u2."isBanned"=false THEN 1 ELSE NULL END) AS "likesCount",
      COUNT(CASE WHEN cl."myStatus" = 'Dislike' AND u2."isBanned"=false THEN 1 ELSE NULL END) AS "dislikesCount"
      ${this.getUserStatus(user)}
      FROM
      "Comments" c
      LEFT JOIN "CommentLikes" cl ON c.id = cl."commentId"
      LEFT JOIN "Users" u ON c."userId"=u.id
      LEFT JOIN "Users" u2 ON cl."userId"=u2.id
      WHERE c.id=${id}
      AND u."isBanned"=false
      GROUP BY
      c.id, c.content, c."createdAt", c."userId", u.login;`;

    const result = await this.dataSource.query(queryString);

    if (!result[0]) throw new NotFoundException();

    return this.sqlGetOutputComment(result[0]);
  }
  private sqlGetOutputComment(
    comment: CommentsSqlType & {
      login: string;
      likesCount: string;
      dislikesCount: string;
      likeStatus: string;
      dislikeStatus: string;
    }
  ): OutputCommentDto {
    const myStatus = +comment.likeStatus
      ? LikeStatus.Like
      : +comment.dislikeStatus
      ? LikeStatus.DisLike
      : LikeStatus.None;
    return {
      id: comment.id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.userId.toString(),
        userLogin: comment.login
      },
      createdAt: comment.createdAt.toISOString(),
      likesInfo: {
        likesCount: +comment.likesCount,
        dislikesCount: +comment.dislikesCount,
        myStatus: myStatus
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
