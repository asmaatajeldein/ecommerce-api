import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CartItemService } from './cart-item.service';
import {
  CreateCartItemRequestDto,
  UpdateCartItemRequestDto,
} from '../cart-item/dto';
import { GetUser } from 'src/common/decorators';
import { User } from '@prisma/client';

@Controller('customers/:customerId/cart-items')
export class CartItemController {
  constructor(private readonly cartItemService: CartItemService) {}

  @Post()
  add(
    @GetUser() currentUser: User,
    @Param('customerId', ParseIntPipe) customerId: number,
    @Body() request: CreateCartItemRequestDto[],
  ) {
    return this.cartItemService.add(currentUser, customerId, request);
  }

  @Get()
  getAll(
    @GetUser() currentUser: User,
    @Param('customerId', ParseIntPipe) customerId: number,
  ) {
    return this.cartItemService.getAll(currentUser, customerId);
  }

  @Patch(':itemId')
  update(
    @GetUser() currentUser: User,
    @Param('customerId', ParseIntPipe) customerId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() request: UpdateCartItemRequestDto,
  ) {
    return this.cartItemService.update(
      currentUser,
      customerId,
      itemId,
      request,
    );
  }

  @Delete(':itemId')
  delete(
    @GetUser() currentUser: User,
    @Param('customerId', ParseIntPipe) customerId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    return this.cartItemService.delete(currentUser, customerId, itemId);
  }
}
