import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryRequestDto } from './create-category-request.dto';

export class UpdateCategoryRequestDto extends PartialType(
  CreateCategoryRequestDto,
) {}
