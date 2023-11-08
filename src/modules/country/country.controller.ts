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
import { CountryService } from './country.service';
import { CreateCountryRequestDto, UpdateCountryRequestDto } from './dto';
import { CheckAbility } from 'src/common/decorators';

@Controller('countries')
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @CheckAbility({ action: 'create', subject: 'Country' })
  @Post()
  create(@Body() request: CreateCountryRequestDto) {
    return this.countryService.create(request);
  }

  @CheckAbility({ action: 'read', subject: 'Country' })
  @Get()
  get(@Query('countryCode') countryCode: string) {
    if (countryCode) {
      return this.countryService.getOneByCountryCode(countryCode);
    }
    return this.countryService.getAll();
  }

  @CheckAbility({ action: 'read', subject: 'Country' })
  @Get(':countryId')
  getOneById(@Param('countryId', ParseIntPipe) countryId: number) {
    return this.countryService.getOneById(countryId);
  }

  @CheckAbility({ action: 'update', subject: 'Country' })
  @Patch(':countryId')
  update(
    @Param('countryId', ParseIntPipe) countryId: number,
    @Body() request: UpdateCountryRequestDto,
  ) {
    return this.countryService.update(countryId, request);
  }

  @CheckAbility({ action: 'delete', subject: 'Country' })
  @Delete(':countryId')
  delete(@Param('countryId', ParseIntPipe) countryId: number) {
    return this.countryService.delete(countryId);
  }
}
