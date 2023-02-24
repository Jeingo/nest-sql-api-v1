import { PipeTransform, Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { DbId } from '../../global-types/global.types';

@Injectable()
export class CheckIdAndParseToDBId implements PipeTransform {
  transform(id: string): DbId {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException();

    return new Types.ObjectId(id);
  }
}
