import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import {
  CreateCategoryDetailRequestDto,
  UpdateCategoryDetailRequestDto,
} from './dto';

@Injectable()
export class CategoryDetailService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(categoryId: number, request: CreateCategoryDetailRequestDto) {
    await this.prismaService.category
      .findUniqueOrThrow({ where: { id: categoryId } })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Invalid categoryId');
          }
        }
        throw error;
      });

    await this.prismaService.datatype
      .findUniqueOrThrow({ where: { id: request.datatypeId } })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Invalid datatypeId');
          }
        }
        throw error;
      });

    const createdDetail = await this.prismaService.detail
      .create({
        data: {
          name: request.name,
          datatype: { connect: { id: request.datatypeId } },
          category: { connect: { id: categoryId } },
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2002') {
            throw new BadRequestException(
              "There's an existing detail with that name for this category",
            );
          }
        }
        throw error;
      });

    return createdDetail;
  }

  async getAll(categoryId: number) {
    const details = await this.prismaService.category
      .findUniqueOrThrow({
        where: { id: categoryId },
        select: { details: true },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Category was not found');
          }
        }
        throw error;
      });

    return details;
  }

  async getOneById(detailId: number) {
    const detail = await this.prismaService.detail
      .findUniqueOrThrow({
        where: { id: detailId },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Detail was not found');
          }
        }
        throw error;
      });

    return detail;
  }

  async update(detailId: number, request: UpdateCategoryDetailRequestDto) {
    const updatedDetail = await this.prismaService.detail
      .update({
        where: { id: detailId },
        data: { ...request },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2002') {
            throw new ForbiddenException(
              "There's an existing detail with that name for the category",
            );
          } else if (error.code == 'P2003') {
            throw new BadRequestException('Invalid datatypeId');
          }
        }
        throw error;
      });

    return {
      message: 'Category detail was updated successfully',
      detail: updatedDetail,
    };
  }

  async delete(detailId: number) {
    const deletedDetail = await this.prismaService.detail
      .delete({ where: { id: detailId } })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Category detail was not found');
          }
        }
        throw error;
      });

    return {
      message: 'Category detail was deleted successfully',
      detail: deletedDetail,
    };
  }
}
