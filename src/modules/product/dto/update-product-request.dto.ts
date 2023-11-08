import { PartialType } from '@nestjs/mapped-types';
import { CreateProductRequestDto } from './create-product-request.dto';

export class UpdateProductRequestDto extends PartialType(
  CreateProductRequestDto,
) {}
