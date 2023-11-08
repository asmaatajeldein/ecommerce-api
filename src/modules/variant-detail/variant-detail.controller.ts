import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { VariantDetailService } from './variant-detail.service';
import {
  CreateVariantDetailRequestDto,
  UpdateVariantDetailRequestDto,
} from './dto';
import { CheckAbility } from 'src/common/decorators';

@Controller('variants/:variantId/details')
export class VariantDetailController {
  constructor(private readonly variantDetailService: VariantDetailService) {}

  @CheckAbility({ action: 'create', subject: 'ProductVariant' })
  @Post()
  create(
    @Param('variantId', ParseIntPipe) variantId: number,
    @Body() request: CreateVariantDetailRequestDto,
  ) {
    return this.variantDetailService.create(variantId, request);
  }

  @CheckAbility({ action: 'read', subject: 'ProductVariant' })
  @Get()
  getAll(@Param('variantId', ParseIntPipe) variantId: number) {
    return this.variantDetailService.getAll(variantId);
  }

  @CheckAbility({ action: 'read', subject: 'ProductVariant' })
  @Get(':detailId')
  getOneById(
    @Param('variantId', ParseIntPipe) variantId: number,
    @Param('detailId', ParseIntPipe) detailId: number,
  ) {
    return this.variantDetailService.getOneById(variantId, detailId);
  }

  @CheckAbility({ action: 'update', subject: 'ProductVariant' })
  @Patch(':detailId')
  update(
    @Param('variantId', ParseIntPipe) variantId: number,
    @Param('detailId', ParseIntPipe) detailId: number,
    @Body() request: UpdateVariantDetailRequestDto,
  ) {
    return this.variantDetailService.update(variantId, detailId, request);
  }

  @CheckAbility({ action: 'delete', subject: 'ProductVariant' })
  @Delete(':detailId')
  delete(
    @Param('variantId', ParseIntPipe) variantId: number,
    @Param('detailId', ParseIntPipe) detailId: number,
  ) {
    return this.variantDetailService.delete(variantId, detailId);
  }
}
