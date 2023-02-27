import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator';
import { BadRequestException, Injectable } from '@nestjs/common';
import { SqlUsersRepository } from '../../users/infrastructure/sql.users.repository';

@ValidatorConstraint({ async: true })
@Injectable()
export class EmailExistAndDontConfirmedConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly sqlUsersRepository: SqlUsersRepository) {}

  async validate(email: string) {
    const user = await this.sqlUsersRepository.getByLoginOrEmail(email);
    if (!user) {
      throw new BadRequestException(['email email is wrong']);
    }
    if (user.emailIsConfirmed) {
      throw new BadRequestException(['email account is already confirmed']);
    }
    return true;
  }
}

export function EmailExistAndDontConfirmed(
  validationOptions?: ValidationOptions
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: EmailExistAndDontConfirmedConstraint
    });
  };
}
