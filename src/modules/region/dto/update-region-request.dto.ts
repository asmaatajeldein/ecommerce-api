import { PartialType } from '@nestjs/mapped-types';
import { CreateRegionRequestDto } from './create-region-request.dto';

export class UpdateRegionRequestDto extends PartialType(
  CreateRegionRequestDto,
) {}
