import { OmitType, PartialType } from '@nestjs/mapped-types';
import { SignupRequestDto } from 'src/modules/auth/dto';

export class UpdateUserInfoRequestDto extends PartialType(
  OmitType(SignupRequestDto, ['password']),
) {}
