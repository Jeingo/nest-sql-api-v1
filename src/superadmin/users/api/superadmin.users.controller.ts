import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { BasicAuthGuard } from '../../../auth/infrastructure/guards/basic.auth.guard';
import { InputCreateUserDto } from './dto/input.create.user.dto';
import { OutputSuperAdminUserDto } from './dto/outputSuperAdminUserDto';
import { CreateUserCommand } from '../application/use-cases/create.user.use.case';
import { QueryUsers } from './types/query.users.type';
import { PaginatedType } from '../../../global-types/global.types';
import { RemoveUserCommand } from '../application/use-cases/remove.user.use.case';
import { InputBanUserDto } from './dto/input.ban.user.dto';
import { BanUserCommand } from '../application/use-cases/ban.user.use.case';
import { SuperAdminUsersQueryRepository } from '../infrastructure/superadmin.users.query.repository';
import { CheckId } from '../../../helper/pipes/check.id.validator.pipe';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('SuperAdmin Users')
@UseGuards(BasicAuthGuard)
@Controller('sa/users')
export class SuperAdminUsersController {
  constructor(
    private readonly sqlSuperAdminUsersQueryRepository: SuperAdminUsersQueryRepository,
    private readonly commandBus: CommandBus
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(
    @Body() createUserDto: InputCreateUserDto
  ): Promise<OutputSuperAdminUserDto> {
    const createdUserId = await this.commandBus.execute(
      new CreateUserCommand(createUserDto)
    );
    return await this.sqlSuperAdminUsersQueryRepository.getById(createdUserId);
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(
    @Query() query: QueryUsers
  ): Promise<PaginatedType<OutputSuperAdminUserDto>> {
    return await this.sqlSuperAdminUsersQueryRepository.getAll(query);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@Param('id', new CheckId()) id: string) {
    await this.commandBus.execute(new RemoveUserCommand(id));
    return;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id/ban')
  async banUser(@Param('id') id: string, @Body() banUserDto: InputBanUserDto) {
    await this.commandBus.execute(new BanUserCommand(banUserDto, id));
    return;
  }
}
