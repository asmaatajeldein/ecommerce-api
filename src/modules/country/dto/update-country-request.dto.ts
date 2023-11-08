import { PartialType } from '@nestjs/mapped-types';
import { CreateCountryRequestDto } from './create-country-request.dto';

export class UpdateCountryRequestDto extends PartialType(
  CreateCountryRequestDto,
) {}
