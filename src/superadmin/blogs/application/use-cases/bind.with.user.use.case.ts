import { CommandHandler } from '@nestjs/cqrs';
import { SqlDbId } from '../../../../global-types/global.types';
import { BadRequestException } from '@nestjs/common';
import { UsersRepository } from '../../../../users/infrastructure/users-repository.service';
import { BlogsRepository } from '../../../../blogs/infrastructure/blogs-repository.service';

export class BindWithUserCommand {
  constructor(public blogId: SqlDbId, public userId: SqlDbId) {}
}

@CommandHandler(BindWithUserCommand)
export class BindWithUserUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly blogsRepository: BlogsRepository
  ) {}

  async execute(command: BindWithUserCommand): Promise<boolean> {
    const blogId = command.blogId;
    const userId = command.userId;
    const blog = await this.blogsRepository.getById(blogId);
    const user = await this.usersRepository.getById(userId);
    if (!blog || !user)
      throw new BadRequestException(['blogId is not correct']);
    if (blog.userId !== null)
      throw new BadRequestException(['blogId is not correct']);
    await this.blogsRepository.bindWithUser(blogId, userId);
    return true;
  }
}
