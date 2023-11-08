import { PartialType } from '@nestjs/mapped-types';
import { CreateBrandRequestDto } from './create-brand-request.dto';

export class UpdateBrandRequestDto extends PartialType(CreateBrandRequestDto) {}
