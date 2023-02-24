import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards
} from '@nestjs/common';
import { SessionsQueryRepository } from '../infrastructure/sessions.query.repository';
import { OutputSessionDto } from './dto/output.session.dto';
import { CookieGuard } from '../../auth/infrastructure/guards/cookie.guard';
import { PayloadFromRefreshToken } from '../../helper/get-decorators/payload.decorator';
import { RefreshTokenPayloadType } from '../../adapters/jwt/types/jwt.type';
import { CommandBus } from '@nestjs/cqrs';
import { RemoveSessionWithoutCurrentCommand } from '../application/use-cases/remove.sessions.without.current.use.case';
import { RemoveSessionByDeviceIdCommand } from '../application/use-cases/remove.session.by.device.id.use.case';

@Controller('security/devices')
export class SecurityDevicesController {
  constructor(
    private readonly sessionsQueryRepository: SessionsQueryRepository,
    private readonly commandBus: CommandBus
  ) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(CookieGuard)
  @Get()
  async getAllActiveSession(
    @PayloadFromRefreshToken() payload: RefreshTokenPayloadType
  ): Promise<OutputSessionDto[]> {
    return await this.sessionsQueryRepository.findAllActiveSession(
      payload.userId
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(CookieGuard)
  @Delete()
  async deleteAllSessionWithoutCurrent(
    @PayloadFromRefreshToken() payload: RefreshTokenPayloadType
  ) {
    await this.commandBus.execute(
      new RemoveSessionWithoutCurrentCommand(payload.userId, payload.iat)
    );
    return;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(CookieGuard)
  @Delete(':id')
  async deleteSessionById(
    @Param('id') id: string,
    @PayloadFromRefreshToken() payload: RefreshTokenPayloadType
  ) {
    await this.commandBus.execute(
      new RemoveSessionByDeviceIdCommand(id, payload.userId)
    );
    return;
  }
}
