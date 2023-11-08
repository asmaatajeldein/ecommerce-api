import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CreateCategoryRequestDto, UpdateCategoryRequestDto } from './dto';

@Injectable()
export class CategoryService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(request: CreateCategoryRequestDto) {
    const createdCategory = await this.prismaService.category
      .create({
        data: {
          name: request.name,
          parentId: request?.parentId ? request.parentId : null,
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2002') {
            throw new BadRequestException(
              "There's an existing category with that name",
            );
          }
        }
        throw error;
      });

    return createdCategory;
  }

  async getAll() {
    const categories = await this.prismaService.category.findMany();

    return { categories };
  }

  async getOneByName(categoryName: string) {
    const category = await this.prismaService.category
      .findUniqueOrThrow({
        where: { name: categoryName },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Category was not found');
          }
        }
        throw error;
      });

    return category;
  }

  async getOneById(categoryId: number) {
    const category = await this.prismaService.category
      .findUniqueOrThrow({
        where: { id: categoryId },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Category was not found');
          }
        }
        throw error;
      });

    return category;
  }

  async update(categoryId: number, request: UpdateCategoryRequestDto) {
    const category = await this.prismaService.category
      .findUniqueOrThrow({
        where: { id: categoryId },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Category was not found');
          }
        }
        throw error;
      });

    const updatedCategory = await this.prismaService.category
      .update({
        where: { id: categoryId },
        data: {
          name: request.name,
          parentId: request?.parentId ? request.parentId : category.parentId,
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2002') {
            throw new BadRequestException(
              "There's an existing category with that name",
            );
          } else {
            throw new BadRequestException(
              "parentId value cannot be the same as the category's id",
            );
          }
        }
        throw error;
      });

    return {
      message: 'Category was updated successfully',
      category: updatedCategory,
    };
  }

  async delete(categoryId: number) {
    const deletedCategory = await this.prismaService.category
      .delete({
        where: { id: categoryId },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Category was not found');
          }
        }
        throw error;
      });

    return {
      message: 'Category was deleted successfully',
      product: deletedCategory,
    };
  }
}
