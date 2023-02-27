import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { SqlUsersRepository } from '../../users/infrastructure/sql.users.repository';

@ValidatorConstraint({ async: true })
@Injectable()
export class LoginExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly sqlUsersRepository: SqlUsersRepository) {}

  async validate(login: string) {
    const user = await this.sqlUsersRepository.getByLoginOrEmail(login);
    return !user;
  }
  defaultMessage() {
    return `login is already exist`;
  }
}

export function LoginExist(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: LoginExistConstraint
    });
  };
}
