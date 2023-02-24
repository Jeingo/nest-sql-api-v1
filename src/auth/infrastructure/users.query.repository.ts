import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  IUserModel,
  User,
  UserDocument
} from '../../users/domain/entities/user.entity';
import { DbId } from '../../global-types/global.types';
import { OutputUserMeDto } from '../api/dto/output.user.me.dto';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private usersModel: IUserModel) {}

  async getMeById(id: DbId): Promise<OutputUserMeDto> {
    const result = await this.usersModel.findById(id);
    if (!result) throw new NotFoundException();
    return this._getOutputMeUser(result);
  }
  private _getOutputMeUser(user: UserDocument): OutputUserMeDto {
    return {
      email: user.email,
      login: user.login,
      userId: user._id.toString()
    };
  }
}
