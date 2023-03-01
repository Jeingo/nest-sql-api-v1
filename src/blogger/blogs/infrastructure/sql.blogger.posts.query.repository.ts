import { Injectable } from '@nestjs/common';
import { SqlPostsQueryRepository } from '../../../posts/infrastructure/sql.posts.query.repository';

@Injectable()
export class SqlBloggerPostsQueryRepository extends SqlPostsQueryRepository {}
