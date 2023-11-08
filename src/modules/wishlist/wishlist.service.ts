import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CreateWishlistRequestDto, UpdateWishlistRequestDto } from './dto';

@Injectable()
export class WishlistService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(customerId: number, request: CreateWishlistRequestDto) {
    const createdWishlist = await this.prismaService.wishlist
      .create({
        data: {
          customerId,
          title: request.title,
          isPrivate: request.isPrivate ? request.isPrivate : true,
        },
        include: { products: { select: { productVariant: true } } },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2002') {
            throw new BadRequestException(
              "There's an existing wishlist with that title",
            );
          }
        }
        throw error;
      });

    return createdWishlist;
  }

  async getAll(customerId: number) {
    const wishlists = await this.prismaService.wishlist.findMany({
      where: { customerId },
    });

    return { wishlists };
  }

  async getOneById(customerId: number, wishlistId: number) {
    const wishlist = await this.prismaService.wishlist
      .findUniqueOrThrow({
        where: { customerId, id: wishlistId },
        include: { products: { select: { productVariant: true } } },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Wishlist was not found');
          }
        }
        throw error;
      });

    return wishlist;
  }

  async update(
    customerId: number,
    wishlistId: number,
    request: UpdateWishlistRequestDto,
  ) {
    const wishlist = await this.prismaService.wishlist
      .findUniqueOrThrow({ where: { customerId, id: wishlistId } })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Wishlist was not found');
          }
        }
        throw error;
      });

    let updatedWishlist;
    if ((request?.title || request?.isPrivate) && !request?.productVariantId) {
      updatedWishlist = await this.prismaService.wishlist.update({
        where: { customerId, id: wishlistId },
        data: {
          title: request.title,
          isPrivate: request.isPrivate,
        },
      });
    } else if (
      !request?.title &&
      !request?.isPrivate &&
      request?.productVariantId
    ) {
      await this.prismaService.productWishlist.upsert({
        where: {
          wishlistId_productVariantId: {
            wishlistId,
            productVariantId: request.productVariantId,
          },
        },
        update: {},
        create: { wishlistId, productVariantId: request.productVariantId },
      });

      updatedWishlist = this.getOneById(customerId, wishlistId);
    }

    return {
      message: 'Wishlist was updated successfully',
      wishlist: updatedWishlist ? updatedWishlist : wishlist,
    };
  }

  async delete(customerId: number, wishlistId: number) {
    const deletedWishlist = await this.prismaService.wishlist
      .delete({
        where: { customerId, id: wishlistId },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Wishlist was not found');
          }
        }
        throw error;
      });

    return {
      message: 'Wishlist was deleted successfully',
      wishlist: deletedWishlist,
    };
  }
}
