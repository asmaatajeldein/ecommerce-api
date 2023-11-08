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
import { AddressService } from './address.service';
import { CreateAddressRequestDto, UpdateAddressRequestDto } from './dto';
import { GetUser } from 'src/common/decorators';
import { User } from '@prisma/client';

@Controller('customers/:customerId/addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  create(
    @GetUser() currentUser: User,
    @Param('customerId', ParseIntPipe) customerId: number,
    @Body() request: CreateAddressRequestDto,
  ) {
    return this.addressService.create(currentUser, customerId, request);
  }

  @Get()
  getAll(
    @GetUser() currentUser: User,
    @Param('customerId', ParseIntPipe) customerId: number,
  ) {
    return this.addressService.getAll(currentUser, customerId);
  }

  @Get(':addressId')
  getOneById(
    @GetUser() currentUser: User,
    @Param('customerId', ParseIntPipe) customerId: number,
    @Param('addressId', ParseIntPipe) addressId: number,
  ) {
    return this.addressService.getOneById(currentUser, customerId, addressId);
  }

  @Patch(':addressId')
  update(
    @GetUser() currentUser: User,
    @Param('customerId', ParseIntPipe) customerId: number,
    @Param('addressId', ParseIntPipe) addressId: number,
    @Body() request: UpdateAddressRequestDto,
  ) {
    return this.addressService.update(
      currentUser,
      customerId,
      addressId,
      request,
    );
  }

  @Patch(':addressId/default')
  setDefault(
    @GetUser() currentUser: User,
    @Param('customerId', ParseIntPipe) customerId: number,
    @Param('addressId', ParseIntPipe) addressId: number,
  ) {
    return this.addressService.setDefault(currentUser, customerId, addressId);
  }

  @Delete(':addressId')
  delete(
    @GetUser() currentUser: User,
    @Param('customerId', ParseIntPipe) customerId: number,
    @Param('addressId', ParseIntPipe) addressId: number,
  ) {
    return this.addressService.delete(currentUser, customerId, addressId);
  }
}
