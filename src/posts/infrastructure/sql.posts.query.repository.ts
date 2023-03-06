import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CurrentUserType,
  Direction,
  LikeStatus,
  PaginatedType,
  SqlDbId
} from '../../global-types/global.types';
import { OutputPostDto } from '../api/dto/output.post.dto';
import { QueryPosts } from '../api/types/query.posts.type';
import { getPaginatedType } from '../../helper/query/query.repository.helper';
import { PostsSqlType } from '../../type-for-sql-entity/posts.sql.type';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class SqlPostsQueryRepository {
  constructor(@InjectDataSource() protected readonly dataSource: DataSource) {}

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

    const skipNumber = (+pageNumber - 1) * +pageSize;

    const queryString = `SELECT p.id,
                         p.title,
                         p."shortDescription",
                         p.content,
                         p."blogId",
                         p."createdAt",
                         b.name AS "blogName",
                         COUNT(CASE WHEN pl."myStatus" = 'Like' AND u2."isBanned"=false THEN 1 ELSE NULL END) AS "likesCount",
                         COUNT(CASE WHEN pl."myStatus" = 'Dislike' AND u2."isBanned"=false THEN 1 ELSE NULL END) AS "dislikesCount",
                         ${this.getUserStatus(user)}
                         array_to_json(ARRAY(
                         SELECT (u.login, u.id, pl2."addedAt")
                         FROM "PostLikes" pl2
                         INNER JOIN "Users" u ON pl2."userId" = u.id
                         WHERE pl2."postId" = p.id AND pl2."myStatus" = 'Like' AND u."isBanned"=false
                         ORDER BY pl2."addedAt" DESC
                         LIMIT 3
                         )) AS "lastLikesUser"
                         FROM "Posts" p
                         LEFT JOIN "Blogs" b ON p."blogId"=b.id 
                         LEFT JOIN "Users" u ON b."userId"=u.id
                         LEFT JOIN "PostLikes" pl ON p.id = pl."postId"
                         LEFT JOIN "Users" u2 ON pl."userId"=u2.id
                         WHERE
                         b."isBanned"=false
                         AND
                         u."isBanned"=false
                         GROUP BY 
                         p.id,
                         p.title,
                         p."shortDescription",
                         p.content,
                         p."blogId",
                         p."createdAt",
                         b.name
                         ORDER BY "${sortBy}" ${sortDirection}
                         LIMIT ${pageSize}
                         OFFSET ${skipNumber}`;

    const queryStringForLength = `SELECT COUNT(p.*)
                                  FROM "Posts" p
                                  LEFT JOIN "Blogs" b ON p."blogId"=b.id 
                                  LEFT JOIN "Users" u ON b."userId"=u.id
                                  WHERE
                                  b."isBanned"=false
                                  AND
                                  u."isBanned"=false`;

    const result = await this.dataSource.query(queryString);
    const resultCount = await this.dataSource.query(queryStringForLength);

    return getPaginatedType(
      result.map(this.sqlGetOutputPostDto),
      +pageSize,
      +pageNumber,
      +resultCount[0].count
    );
  }
  async getAllByBlogId(
    query: QueryPosts,
    blogId: SqlDbId,
    user?: CurrentUserType
  ): Promise<PaginatedType<OutputPostDto>> {
    const blog = await this.dataSource.query(
      `SELECT * FROM "Blogs" WHERE id=$1;`,
      [blogId]
    );
    if (!blog[0]) throw new NotFoundException();

    const {
      sortBy = 'createdAt',
      sortDirection = Direction.DESC,
      pageNumber = 1,
      pageSize = 10
    } = query;

    const skipNumber = (+pageNumber - 1) * +pageSize;

    const queryString = `SELECT p.id,
                         p.title,
                         p."shortDescription",
                         p.content,
                         p."blogId",
                         p."createdAt",
                         b.name AS "blogName",
                         COUNT(CASE WHEN pl."myStatus" = 'Like' AND u2."isBanned"=false THEN 1 ELSE NULL END) AS "likesCount",
                         COUNT(CASE WHEN pl."myStatus" = 'Dislike' AND u2."isBanned"=false THEN 1 ELSE NULL END) AS "dislikesCount",
                         ${this.getUserStatus(user)}
                         array_to_json(ARRAY(
                         SELECT (u.login, u.id, pl2."addedAt")
                         FROM "PostLikes" pl2
                         INNER JOIN "Users" u ON pl2."userId" = u.id
                         WHERE pl2."postId" = p.id AND pl2."myStatus" = 'Like' AND u."isBanned"=false
                         ORDER BY pl2."addedAt" DESC
                         LIMIT 3
                         )) AS "lastLikesUser"
                         FROM "Posts" p
                         LEFT JOIN "Blogs" b ON p."blogId"=b.id 
                         LEFT JOIN "Users" u ON b."userId"=u.id
                         LEFT JOIN "PostLikes" pl ON p.id = pl."postId"
                         LEFT JOIN "Users" u2 ON pl."userId"=u2.id
                         WHERE
                         b."isBanned"=false
                         AND
                         u."isBanned"=false
                         AND
                         p."blogId"=${blogId}
                         GROUP BY 
                         p.id,
                         p.title,
                         p."shortDescription",
                         p.content,
                         p."blogId",
                         p."createdAt",
                         b.name
                         ORDER BY "${sortBy}" ${sortDirection}
                         LIMIT ${pageSize}
                         OFFSET ${skipNumber}`;

    const queryStringForLength = `SELECT COUNT(p.*)
                                  FROM "Posts" p
                                  LEFT JOIN "Blogs" b ON p."blogId"=b.id 
                                  LEFT JOIN "Users" u ON b."userId"=u.id
                                  WHERE
                                  b."isBanned"=false
                                  AND
                                  u."isBanned"=false
                                  AND
                                  p."blogId"=${blogId}`;

    const result = await this.dataSource.query(queryString);
    const resultCount = await this.dataSource.query(queryStringForLength);

    return getPaginatedType(
      result.map(this.sqlGetOutputPostDto),
      +pageSize,
      +pageNumber,
      +resultCount[0].count
    );
  }
  async getById(id: SqlDbId, user?: CurrentUserType): Promise<OutputPostDto> {
    const queryString = `SELECT p.id,
                         p.title,
                         p."shortDescription",
                         p.content,
                         p."blogId",
                         p."createdAt",
                         b.name AS "blogName",
                         COUNT(CASE WHEN pl."myStatus" = 'Like' AND u2."isBanned"=false THEN 1 ELSE NULL END) AS "likesCount",
                         COUNT(CASE WHEN pl."myStatus" = 'Dislike' AND u2."isBanned"=false THEN 1 ELSE NULL END) AS "dislikesCount",
                         ${this.getUserStatus(user)}
                         array_to_json(ARRAY(
                         SELECT (u.login, u.id, pl2."addedAt")
                         FROM "PostLikes" pl2
                         INNER JOIN "Users" u ON pl2."userId" = u.id
                         WHERE pl2."postId" = p.id AND pl2."myStatus" = 'Like' AND u."isBanned"=false
                         ORDER BY pl2."addedAt" DESC
                         LIMIT 3
                         )) AS "lastLikesUser"
                         FROM "Posts" p
                         LEFT JOIN "Blogs" b ON p."blogId"=b.id 
                         LEFT JOIN "Users" u ON b."userId"=u.id
                         LEFT JOIN "PostLikes" pl ON p.id = pl."postId"
                         LEFT JOIN "Users" u2 ON pl."userId"=u2.id
                         WHERE
                         b."isBanned"=false
                         AND
                         u."isBanned"=false
                         AND
                         p.id=${id}
                         GROUP BY 
                         p.id,
                         p.title,
                         p."shortDescription",
                         p.content,
                         p."blogId",
                         p."createdAt",
                         b.name`;

    const result = await this.dataSource.query(queryString);
    if (!result[0]) throw new NotFoundException();
    return this.sqlGetOutputPostDto(result[0]);
  }
  private sqlGetOutputPostDto(
    post: PostsSqlType & {
      blogName: string;
      likesCount: string;
      dislikesCount: string;
      likeStatus: string;
      dislikeStatus: string;
      lastLikesUser: any;
    }
  ): OutputPostDto {
    const myStatus = +post.likeStatus
      ? LikeStatus.Like
      : +post.dislikeStatus
      ? LikeStatus.DisLike
      : LikeStatus.None;

    const lastLikesUserResult = post.lastLikesUser.map((u) => {
      return {
        login: u.f1,
        userId: u.f2.toString(),
        addedAt: new Date(u.f3).toISOString()
      };
    });

    return {
      id: post.id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId.toString(),
      blogName: post.blogName,
      createdAt: post.createdAt.toISOString(),
      extendedLikesInfo: {
        likesCount: +post.likesCount,
        dislikesCount: +post.dislikesCount,
        myStatus: myStatus,
        newestLikes: lastLikesUserResult
      }
    };
  }
  getUserStatus(user: CurrentUserType): string {
    if (user) {
      return `COUNT(CASE WHEN pl."userId" = ${user.userId} AND pl."myStatus" = 'Like' THEN 1 ELSE NULL END )AS "likeStatus",
              COUNT(CASE WHEN pl."userId" = ${user.userId} AND pl."myStatus" = 'Dislike' THEN 1 ELSE NULL END )AS "dislikeStatus",`;
    }
    return ``;
  }
}
