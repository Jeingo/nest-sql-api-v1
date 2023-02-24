import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator';
import { LikeStatus } from '../../global-types/global.types';

@ValidatorConstraint()
export class IsLikeConstraint implements ValidatorConstraintInterface {
  validate(like: LikeStatus) {
    return Object.values(LikeStatus).includes(like);
  }
  defaultMessage() {
    return `likeStatus it isn't available like status`;
  }
}

export function IsLike(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsLikeConstraint
    });
  };
}
