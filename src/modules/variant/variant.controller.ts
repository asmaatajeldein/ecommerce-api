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
import { VariantService } from './variant.service';
import { CreateVariantRequestDto, UpdateVariantRequestDto } from './dto';
import { CheckAbility } from 'src/common/decorators';

@Controller()
export class VariantController {
  constructor(private readonly variantService: VariantService) {}

  @CheckAbility({ action: 'create', subject: 'ProductVariant' })
  @Post('products/:productId/variants')
  create(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() request: CreateVariantRequestDto,
  ) {
    return this.variantService.create(productId, request);
  }

  @CheckAbility({ action: 'read', subject: 'ProductVariant' })
  @Get('products/:productId/variants')
  getAll(@Param('productId', ParseIntPipe) productId: number) {
    return this.variantService.getAll(productId);
  }

  @CheckAbility({ action: 'read', subject: 'ProductVariant' })
  @Get('products/:productId/variants/count')
  getCount(@Param('productId', ParseIntPipe) productId: number) {
    return this.variantService.getCount(productId);
  }

  @CheckAbility({ action: 'read', subject: 'ProductVariant' })
  @Get('variants/:variantId')
  getOneById(@Param('variantId', ParseIntPipe) variantId: number) {
    return this.variantService.getOneById(variantId);
  }

  @CheckAbility({ action: 'update', subject: 'ProductVariant' })
  @Patch('variants/:variantId')
  update(
    @Param('variantId', ParseIntPipe) variantId: number,
    @Body() request: UpdateVariantRequestDto,
  ) {
    return this.variantService.update(variantId, request);
  }

  @CheckAbility({ action: 'delete', subject: 'ProductVariant' })
  @Delete('variants/:variantId')
  delete(@Param('variantId', ParseIntPipe) variantId: number) {
    return this.variantService.delete(variantId);
  }
}
