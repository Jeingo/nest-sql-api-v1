import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Query,
  UseGuards
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { SqlSuperAdminBlogsQueryRepository } from '../infrastructure/superadmin.blogs.query.repository';
import { QueryBlogs } from '../../../blogs/api/types/query.blogs.type';
import { OutputSuperAdminBlogDto } from './dto/output.superadmin.blog.dto';
import { BasicAuthGuard } from '../../../auth/infrastructure/guards/basic.auth.guard';
import { BindWithUserCommand } from '../application/use-cases/bind.with.user.use.case';
import { PaginatedType, SqlDbId } from '../../../global-types/global.types';
import { InputBanBlogDto } from './dto/input.ban.blog.dto';
import { CheckId } from '../../../helper/pipes/check.id.validator.pipe';
import { BanBlogCommand } from '../application/use-cases/ban.blog.use.case';

@UseGuards(BasicAuthGuard)
@Controller('sa/blogs')
export class SuperAdminBlogsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly superAdminBlogsQueryRepository: SqlSuperAdminBlogsQueryRepository
  ) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(
    @Query() query: QueryBlogs
  ): Promise<PaginatedType<OutputSuperAdminBlogDto>> {
    return await this.superAdminBlogsQueryRepository.getAll(query);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':blogId/bind-with-user/:userId')
  async bindWithUser(
    @Param('blogId') blogId: string,
    @Param('userId') userId: string
  ) {
    if (Number.isNaN(+blogId) || Number.isNaN(+userId))
      throw new BadRequestException(['blogId is not correct']);
    await this.commandBus.execute(new BindWithUserCommand(blogId, userId));
    return;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':blogId/ban')
  async banBlog(
    @Param('blogId', new CheckId()) blogId: SqlDbId,
    @Body() banBlogDto: InputBanBlogDto
  ) {
    await this.commandBus.execute(new BanBlogCommand(blogId, banBlogDto));
    return;
  }
}
