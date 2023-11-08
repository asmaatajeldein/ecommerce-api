import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CreateProductRequestDto, UpdateProductRequestDto } from './dto';

@Injectable()
export class ProductService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(request: CreateProductRequestDto) {
    const createdProduct = await this.prismaService.product.create({
      data: { ...request },
    });

    return createdProduct;
  }

  async getAll() {
    const products = await this.prismaService.product.findMany();

    return { products };
  }

  async getOneById(productId: number) {
    const product = await this.prismaService.product
      .findUniqueOrThrow({
        where: { id: productId },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Product was not found');
          }
        }
        throw error;
      });

    return product;
  }

  async update(productId: number, request: UpdateProductRequestDto) {
    const updatedProduct = await this.prismaService.product
      .update({
        where: { id: productId },
        data: { ...request },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Product was not found');
          }
        }
        throw error;
      });

    return {
      message: 'Product was updated successfully',
      product: updatedProduct,
    };
  }

  async delete(productId: number) {
    const deletedProduct = await this.prismaService.product
      .delete({
        where: { id: productId },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Product was not found');
          }
        }
        throw error;
      });

    return {
      message: 'Product was deleted successfully',
      product: deletedProduct,
    };
  }
}
