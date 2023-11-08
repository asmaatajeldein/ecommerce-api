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
import { WishlistService } from './wishlist.service';
import { CreateWishlistRequestDto, UpdateWishlistRequestDto } from './dto';
import { CheckAbility } from 'src/common/decorators';

@Controller('customers/:customerId/wishlists')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @CheckAbility({ action: 'create', subject: 'Wishlist' })
  @Post()
  create(
    @Param('customerId', ParseIntPipe) customerId: number,
    @Body() request: CreateWishlistRequestDto,
  ) {
    return this.wishlistService.create(customerId, request);
  }

  @CheckAbility({ action: 'read', subject: 'Wishlist' })
  @Get()
  getAll(@Param('customerId', ParseIntPipe) customerId: number) {
    return this.wishlistService.getAll(customerId);
  }

  @CheckAbility({ action: 'read', subject: 'Wishlist' })
  @Get(':wishlistId')
  getOneById(
    @Param('customerId', ParseIntPipe) customerId: number,
    @Param('wishlistId', ParseIntPipe) wishlistId: number,
  ) {
    return this.wishlistService.getOneById(customerId, wishlistId);
  }

  @CheckAbility({ action: 'update', subject: 'Wishlist' })
  @Patch(':wishlistId')
  update(
    @Param('customerId', ParseIntPipe) customerId: number,
    @Param('wishlistId', ParseIntPipe) wishlistId: number,
    @Body() request: UpdateWishlistRequestDto,
  ) {
    return this.wishlistService.update(customerId, wishlistId, request);
  }

  @CheckAbility({ action: 'delete', subject: 'Wishlist' })
  @Delete(':wishlistId')
  delete(
    @Param('customerId', ParseIntPipe) customerId: number,
    @Param('wishlistId', ParseIntPipe) wishlistId: number,
  ) {
    return this.wishlistService.delete(customerId, wishlistId);
  }
}
