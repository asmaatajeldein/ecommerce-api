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
import { CategoryDetailService } from './category-detail.service';
import {
  CreateCategoryDetailRequestDto,
  UpdateCategoryDetailRequestDto,
} from './dto';
import { CheckAbility } from 'src/common/decorators';

@Controller('')
export class CategoryDetailController {
  constructor(private readonly categoryDetailService: CategoryDetailService) {}

  @CheckAbility({ action: 'create', subject: 'Category' })
  @Post('categories/:categoryId/details')
  create(
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Body() request: CreateCategoryDetailRequestDto,
  ) {
    return this.categoryDetailService.create(categoryId, request);
  }

  @CheckAbility({ action: 'read', subject: 'Category' })
  @Get('/categories/:categoryId/details')
  getAll(@Param('categoryId', ParseIntPipe) categoryId: number) {
    return this.categoryDetailService.getAll(categoryId);
  }

  @CheckAbility({ action: 'read', subject: 'Category' })
  @Get('/details/:detailId')
  getOneById(@Param('detailId', ParseIntPipe) detailId: number) {
    return this.categoryDetailService.getOneById(detailId);
  }

  @CheckAbility({ action: 'update', subject: 'Category' })
  @Patch('/details/:detailId')
  update(
    @Param('detailId', ParseIntPipe) detailId: number,
    @Body() request: UpdateCategoryDetailRequestDto,
  ) {
    return this.categoryDetailService.update(detailId, request);
  }

  @CheckAbility({ action: 'delete', subject: 'Category' })
  @Delete('/details/:detailId')
  delete(@Param('detailId', ParseIntPipe) detailId: number) {
    return this.categoryDetailService.delete(detailId);
  }
}
