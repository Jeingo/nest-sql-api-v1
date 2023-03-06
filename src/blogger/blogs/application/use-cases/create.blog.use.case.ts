import { CommandHandler } from '@nestjs/cqrs';
import { InputCreateBlogDto } from '../../api/dto/input.create.blog.dto';
import {
  CurrentUserType,
  SqlDbId
} from '../../../../global-types/global.types';
import { BlogsRepository } from '../../../../blogs/infrastructure/blogs-repository.service';

export class CreateBlogCommand {
  constructor(
    public createBlogDto: InputCreateBlogDto,
    public user: CurrentUserType
  ) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase {
  constructor(private readonly sqlBlogsRepository: BlogsRepository) {}

  async execute(command: CreateBlogCommand): Promise<SqlDbId> {
    const { name, description, websiteUrl } = command.createBlogDto;
    const { userId } = command.user;
    const createdBlog = await this.sqlBlogsRepository.create(
      name,
      description,
      websiteUrl,
      userId
    );

    return createdBlog.id.toString();
  }
}
