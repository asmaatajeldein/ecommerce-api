import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CreateVariantRequestDto, UpdateVariantRequestDto } from './dto';

@Injectable()
export class VariantService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(productId: number, request: CreateVariantRequestDto) {
    const createdVariant = await this.prismaService.productVariant
      .create({
        data: { ...request, product: { connect: { id: productId } } },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Invalid productId');
          } else if (error.code == 'P2002') {
            throw new BadRequestException(
              "There's an existing variant with the same sku",
            );
          }
        }
        throw error;
      });

    return createdVariant;
  }

  async getAll(productId: number) {
    const product = await this.prismaService.product
      .findUniqueOrThrow({
        where: { id: productId },
        include: { variants: true },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Invalid productId');
          }
        }
        throw error;
      });

    return product.variants;
  }

  async getCount(productId: number) {
    const variantsCount = await this.prismaService.product
      .findUniqueOrThrow({
        where: { id: productId },
        select: { _count: { select: { variants: true } } },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Invalid productId');
          }
        }
        throw error;
      });

    return { count: variantsCount._count.variants };
  }

  async getOneById(variantId: number) {
    const variant = await this.prismaService.productVariant
      .findUniqueOrThrow({
        where: { id: variantId },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Variant was not found');
          }
        }
        throw error;
      });

    return variant;
  }

  async update(variantId: number, request: UpdateVariantRequestDto) {
    const updatedVariant = await this.prismaService.productVariant
      .update({
        where: { id: variantId },
        data: { ...request },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Variant was not found');
          }
        }
        throw error;
      });

    return {
      message: 'Variant was updated successfully',
      variant: updatedVariant,
    };
  }

  async delete(variantId: number) {
    const deletedVariant = await this.prismaService.productVariant
      .delete({
        where: { id: variantId },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Variant was not found');
          }
        }
        throw error;
      });

    return {
      message: 'Variant was deleted successfully',
      variant: deletedVariant,
    };
  }
}
