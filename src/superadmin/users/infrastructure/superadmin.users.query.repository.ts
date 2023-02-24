import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  IUserModel,
  User,
  UserDocument
} from '../../../users/domain/entities/user.entity';
import { BanStatus, QueryUsers } from '../api/types/query.users.type';
import { OutputSuperAdminUserDto } from '../api/dto/outputSuperAdminUserDto';
import {
  DbId,
  Direction,
  PaginatedType
} from '../../../global-types/global.types';
import {
  getPaginatedType,
  makeDirectionToNumber
} from '../../../helper/query/query.repository.helper';

@Injectable()
export class SuperAdminUsersQueryRepository {
  constructor(@InjectModel(User.name) private usersModel: IUserModel) {}

  async getAll(
    query: QueryUsers
  ): Promise<PaginatedType<OutputSuperAdminUserDto>> {
    const {
      banStatus = BanStatus.all,
      searchLoginTerm = null,
      searchEmailTerm = null,
      sortBy = 'createdAt',
      sortDirection = Direction.DESC,
      pageNumber = 1,
      pageSize = 10
    } = query;
    const sortDirectionNumber = makeDirectionToNumber(sortDirection);
    const skipNumber = (+pageNumber - 1) * +pageSize;

    const filter = (a: any, b: any, c: any) => ({ ...c, $or: [a, b] });
    const loginFilter = searchLoginTerm
      ? { login: { $regex: new RegExp(searchLoginTerm, 'gi') } }
      : {};
    const emailFilter = searchEmailTerm
      ? { email: { $regex: new RegExp(searchEmailTerm, 'gi') } }
      : {};
    const banFilter = this._getBanFilter(banStatus);
    const filterMain = filter(loginFilter, emailFilter, banFilter);
    const countAllDocuments = await this.usersModel.countDocuments(filterMain);
    const result = await this.usersModel
      .find(filterMain)
      .sort({ [sortBy]: sortDirectionNumber })
      .skip(skipNumber)
      .limit(+pageSize);
    const mappedUser = result.map(this._getOutputUser);
    return getPaginatedType(
      mappedUser,
      +pageSize,
      +pageNumber,
      countAllDocuments
    );
  }
  async getById(id: DbId): Promise<OutputSuperAdminUserDto> {
    const result = await this.usersModel.findById(id);
    if (!result) throw new NotFoundException();
    return this._getOutputUser(result);
  }

  private _getOutputUser(user: UserDocument): OutputSuperAdminUserDto {
    return {
      id: user._id.toString(),
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
      banInfo: {
        isBanned: user.banInfo.isBanned,
        banDate: user.banInfo.banDate,
        banReason: user.banInfo.banReason
      }
    };
  }
  private _getBanFilter(banStatus: BanStatus) {
    if (banStatus === BanStatus.all) {
      return {};
    }
    if (banStatus === BanStatus.banned) {
      return { 'banInfo.isBanned': true };
    }
    return { 'banInfo.isBanned': false };
  }
}
