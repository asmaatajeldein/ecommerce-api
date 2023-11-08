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
import { CityService } from './city.service';
import { CreateCityRequestDto, UpdateCityRequestDto } from './dto';
import { CheckAbility } from 'src/common/decorators';

@Controller('')
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @CheckAbility({ action: 'create', subject: 'City' })
  @Post('regions/:regionId/cities')
  create(
    @Param('regionId', ParseIntPipe) regionId: number,
    @Body() request: CreateCityRequestDto,
  ) {
    return this.cityService.create(regionId, request);
  }

  @CheckAbility({ action: 'read', subject: 'City' })
  @Get('regions/:regionId/cities')
  getAll(@Param('regionId', ParseIntPipe) regionId: number) {
    return this.cityService.getAll(regionId);
  }

  @CheckAbility({ action: 'read', subject: 'City' })
  @Get('regions/:regionId/cities/count')
  getCount(@Param('regionId', ParseIntPipe) regionId: number) {
    return this.cityService.getCount(regionId);
  }

  @CheckAbility({ action: 'read', subject: 'City' })
  @Get('cities/:cityId')
  getOneById(@Param('cityId', ParseIntPipe) cityId: number) {
    return this.cityService.getOneById(cityId);
  }

  @CheckAbility({ action: 'update', subject: 'City' })
  @Patch('cities/:cityId')
  update(
    @Param('cityId', ParseIntPipe) cityId: number,
    @Body() request: UpdateCityRequestDto,
  ) {
    return this.cityService.update(cityId, request);
  }

  @CheckAbility({ action: 'delete', subject: 'City' })
  @Delete('cities/:cityId')
  delete(@Param('cityId', ParseIntPipe) cityId: number) {
    return this.cityService.delete(cityId);
  }
}
