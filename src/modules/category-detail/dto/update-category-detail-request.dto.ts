import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDetailRequestDto } from './create-category-detail-request.dto';

export class UpdateCategoryDetailRequestDto extends PartialType(
  CreateCategoryDetailRequestDto,
) {}
