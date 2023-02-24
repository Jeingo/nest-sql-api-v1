import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IUserModel, User, UserDocument } from '../domain/entities/user.entity';
import { DbId } from '../../global-types/global.types';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private usersModel: IUserModel) {}

  create(
    login: string,
    password: string,
    email: string,
    isConfirmed: boolean
  ): UserDocument {
    return this.usersModel.make(login, password, email, isConfirmed);
  }
  async getById(id: DbId): Promise<UserDocument> {
    return this.usersModel.findById(id);
  }
  async getByUniqueField(uniqueField: string): Promise<UserDocument> {
    return this.usersModel
      .findOne()
      .or([
        { email: uniqueField },
        { login: uniqueField },
        { 'emailConfirmation.confirmationCode': uniqueField },
        { 'passwordRecoveryConfirmation.passwordRecoveryCode': uniqueField }
      ]);
  }
  async save(user: UserDocument): Promise<UserDocument> {
    return await user.save();
  }
  async delete(id: DbId): Promise<UserDocument> {
    return this.usersModel.findByIdAndDelete(id);
  }
}
