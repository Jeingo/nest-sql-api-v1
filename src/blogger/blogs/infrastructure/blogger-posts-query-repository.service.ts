import { Injectable } from '@nestjs/common';
import { PostsQueryRepository } from '../../../posts/infrastructure/posts-query-repository.service';

@Injectable()
export class BloggerPostsQueryRepository extends PostsQueryRepository {}
