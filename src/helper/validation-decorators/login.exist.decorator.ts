import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../users/infrastructure/users.repository';

@ValidatorConstraint({ async: true })
@Injectable()
export class LoginExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly usersRepository: UsersRepository) {}

  async validate(login: string) {
    const user = await this.usersRepository.getByUniqueField(login);
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
