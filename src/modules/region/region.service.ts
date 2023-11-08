import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CreateRegionRequestDto, UpdateRegionRequestDto } from './dto';

@Injectable()
export class RegionService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(countryId: number, request: CreateRegionRequestDto) {
    const createdRegion = await this.prismaService.region
      .create({
        data: {
          name: request.name
            .split(' ')
            .map((word) => word[0].toUpperCase() + word.slice(1))
            .join(' '),
          country: { connect: { id: countryId } },
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Invalid countryId');
          } else if (error.code == 'P2002') {
            throw new BadRequestException(
              "There's an existing region with that name for this country",
            );
          }
        }
        throw error;
      });

    return createdRegion;
  }

  async getAll(countryId: number) {
    const country = await this.prismaService.country
      .findUniqueOrThrow({
        where: { id: countryId },
        include: { regions: { select: { id: true, name: true } } },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Invalid countryId');
          }
        }
        throw error;
      });

    return { regions: country.regions };
  }

  async getCount(countryId: number) {
    const regionsCount = await this.prismaService.country
      .findUniqueOrThrow({
        where: { id: countryId },
        select: { _count: { select: { regions: true } } },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Invalid countryId');
          }
        }
        throw error;
      });

    return { count: regionsCount._count.regions };
  }

  async getOneById(regionId: number) {
    const region = await this.prismaService.region
      .findUniqueOrThrow({
        where: { id: regionId },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Region was not found');
          }
        }
        throw error;
      });

    return region;
  }

  async update(regionId: number, request: UpdateRegionRequestDto) {
    const region = await this.prismaService.region
      .findUniqueOrThrow({
        where: { id: regionId },
        include: { country: true },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Region was not found');
          }
        }
        throw error;
      });

    const updatedRegion = await this.prismaService.region
      .update({
        where: { id: regionId },
        data: {
          name: request?.name
            ? request?.name
                .split(' ')
                .map((word) => word[0].toUpperCase() + word.slice(1))
                .join(' ')
            : region.name,
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2002') {
            throw new BadRequestException(
              `There's an existing region with that name for ${region.country.name}`,
            );
          }
        }
        throw error;
      });

    return {
      message: 'Region was updated successfully',
      region: updatedRegion,
    };
  }

  async delete(regionId: number) {
    const deletedRegion = await this.prismaService.region
      .delete({
        where: { id: regionId },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Region was not found');
          }
        }
        throw error;
      });

    return {
      message: 'Region was deleted successfully',
      region: deletedRegion,
    };
  }
}
