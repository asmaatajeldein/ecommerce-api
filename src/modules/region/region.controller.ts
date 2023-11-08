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
import { RegionService } from './region.service';
import { CreateRegionRequestDto, UpdateRegionRequestDto } from './dto';
import { CheckAbility } from 'src/common/decorators';

@Controller('')
export class RegionController {
  constructor(private readonly regionService: RegionService) {}

  @CheckAbility({ action: 'create', subject: 'Region' })
  @Post('countries/:countryId/regions')
  create(
    @Param('countryId', ParseIntPipe) countryId: number,
    @Body() request: CreateRegionRequestDto,
  ) {
    return this.regionService.create(countryId, request);
  }

  @CheckAbility({ action: 'read', subject: 'Region' })
  @Get('countries/:countryId/regions')
  getAll(@Param('countryId', ParseIntPipe) countryId: number) {
    return this.regionService.getAll(countryId);
  }

  @CheckAbility({ action: 'read', subject: 'Region' })
  @Get('countries/:countryId/regions/count')
  getCount(@Param('countryId', ParseIntPipe) countryId: number) {
    return this.regionService.getCount(countryId);
  }

  @CheckAbility({ action: 'read', subject: 'Region' })
  @Get('regions/:regionId')
  getOneById(@Param('regionId', ParseIntPipe) regionId: number) {
    return this.regionService.getOneById(regionId);
  }

  @CheckAbility({ action: 'update', subject: 'Region' })
  @Patch('regions/:regionId')
  update(
    @Param('regionId', ParseIntPipe) regionId: number,
    @Body() request: UpdateRegionRequestDto,
  ) {
    return this.regionService.update(regionId, request);
  }

  @CheckAbility({ action: 'delete', subject: 'Region' })
  @Delete('regions/:regionId')
  delete(@Param('regionId', ParseIntPipe) regionId: number) {
    return this.regionService.delete(regionId);
  }
}
