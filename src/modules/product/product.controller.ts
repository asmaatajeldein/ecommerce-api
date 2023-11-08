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
import { ProductService } from './product.service';
import { CreateProductRequestDto, UpdateProductRequestDto } from './dto';
import { CheckAbility } from 'src/common/decorators';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @CheckAbility({ action: 'create', subject: 'Product' })
  @Post()
  create(@Body() request: CreateProductRequestDto) {
    return this.productService.create(request);
  }

  @CheckAbility({ action: 'read', subject: 'Product' })
  @Get()
  getAll() {
    return this.productService.getAll();
  }

  @CheckAbility({ action: 'read', subject: 'Product' })
  @Get(':productId')
  getOneById(@Param('productId', ParseIntPipe) productId: number) {
    return this.productService.getOneById(productId);
  }

  @CheckAbility({ action: 'update', subject: 'Product' })
  @Patch(':productId')
  update(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() request: UpdateProductRequestDto,
  ) {
    return this.productService.update(productId, request);
  }

  @CheckAbility({ action: 'delete', subject: 'Product' })
  @Delete(':productId')
  delete(@Param('productId', ParseIntPipe) productId: number) {
    return this.productService.delete(productId);
  }
}
