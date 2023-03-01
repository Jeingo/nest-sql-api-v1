import { CommandHandler } from '@nestjs/cqrs';
import { InputCreateBlogDto } from '../../api/dto/input.create.blog.dto';
import {
  CurrentUserType,
  SqlDbId
} from '../../../../global-types/global.types';
import { SqlBlogRepository } from '../../../../blogs/infrastructure/sql.blog.repository';

export class CreateBlogCommand {
  constructor(
    public createBlogDto: InputCreateBlogDto,
    public user: CurrentUserType
  ) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase {
  constructor(private readonly sqlBlogsRepository: SqlBlogRepository) {}

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
