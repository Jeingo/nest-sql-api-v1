import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator';
import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersRepository } from '../../users/infrastructure/users.repository';

@ValidatorConstraint({ async: true })
@Injectable()
export class EmailConfirmationCodeIsCorrectConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async validate(confirmationCode: string) {
    const user = await this.usersRepository.getByUUIDCode(confirmationCode);
    if (!user) {
      throw new BadRequestException(['code code is wrong']);
    }
    if (user.emailIsConfirmed) {
      throw new BadRequestException(['code Account is already confirmed']);
    }
    if (user.emailExpirationDate < new Date()) {
      throw new BadRequestException(['code code is expired']);
    }
    return true;
  }
}

export function EmailConfirmationCodeIsCorrect(
  validationOptions?: ValidationOptions
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: EmailConfirmationCodeIsCorrectConstraint
    });
  };
}
