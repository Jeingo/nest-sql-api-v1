import { CommandHandler } from '@nestjs/cqrs';
import { InputCreateBlogDto } from '../../api/dto/input.create.blog.dto';
import {
  CurrentUserType,
  SqlDbId
} from '../../../../global-types/global.types';
import { BlogsRepository } from '../../../../blogs/infrastructure/blogs.repository';

export class CreateBlogCommand {
  constructor(
    public createBlogDto: InputCreateBlogDto,
    public user: CurrentUserType
  ) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(command: CreateBlogCommand): Promise<SqlDbId> {
    const { name, description, websiteUrl } = command.createBlogDto;
    const { userId } = command.user;
    const blog = this.blogsRepository.create(
      name,
      description,
      websiteUrl,
      userId
    );
    await this.blogsRepository.save(blog);
    return blog.id.toString();
  }
}
