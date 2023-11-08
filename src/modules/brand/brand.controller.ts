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
import { BrandService } from './brand.service';
import { CreateBrandRequestDto, UpdateBrandRequestDto } from './dto';
import { CheckAbility, GetUser } from 'src/common/decorators';
import { User } from '@prisma/client';

@CheckAbility({ action: 'manage', subject: 'Brand' })
@Controller('brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @CheckAbility({ action: 'create', subject: 'Brand' })
  @Post()
  create(@GetUser() currentUser: User, @Body() request: CreateBrandRequestDto) {
    return this.brandService.create(currentUser, request);
  }

  @CheckAbility({ action: 'read', subject: 'Brand' })
  @Get()
  get(@Query('brandName') brandName: string) {
    if (brandName) {
      return this.brandService.getOneByName(brandName);
    }
    return this.brandService.getAll();
  }

  @CheckAbility({ action: 'read', subject: 'Brand' })
  @Get(':brandId')
  getOneyId(@Param('brandId', ParseIntPipe) brandId: number) {
    return this.brandService.getOneById(brandId);
  }

  @CheckAbility({ action: 'update', subject: 'Brand' })
  @Patch(':brandId')
  update(
    @Param('brandId', ParseIntPipe) brandId: number,
    @Body() request: UpdateBrandRequestDto,
  ) {
    return this.brandService.update(brandId, request);
  }

  @CheckAbility({ action: 'delete', subject: 'Brand' })
  @Delete(':brandId')
  delete(@Param('brandId', ParseIntPipe) brandId: number) {
    return this.brandService.delete(brandId);
  }
}
