import { PartialType } from '@nestjs/mapped-types';
import { CreateCityRequestDto } from './create-city-request.dto';

export class UpdateCityRequestDto extends PartialType(CreateCityRequestDto) {}
