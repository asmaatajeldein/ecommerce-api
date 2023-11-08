import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryRequestDto, UpdateCategoryRequestDto } from './dto';
import { CheckAbility } from 'src/common/decorators';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @CheckAbility({ action: 'create', subject: 'Category' })
  @Post()
  create(@Body() request: CreateCategoryRequestDto) {
    return this.categoryService.create(request);
  }

  @CheckAbility({ action: 'read', subject: 'Category' })
  @Get()
  get(@Query('categoryName') categoryName: string) {
    if (categoryName) {
      return this.categoryService.getOneByName(categoryName);
    }
    return this.categoryService.getAll();
  }

  @CheckAbility({ action: 'read', subject: 'Category' })
  @Get(':categoryId')
  getOneById(@Param('categoryId', ParseIntPipe) categoryId: number) {
    return this.categoryService.getOneById(categoryId);
  }

  @CheckAbility({ action: 'update', subject: 'Category' })
  @Patch(':categoryId')
  update(
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Body() request: UpdateCategoryRequestDto,
  ) {
    return this.categoryService.update(categoryId, request);
  }

  @CheckAbility({ action: 'delete', subject: 'Category' })
  @Delete(':categoryId')
  delete(@Param('categoryId', ParseIntPipe) categoryId: number) {
    return this.categoryService.delete(categoryId);
  }
}
