import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateCityRequestDto, UpdateCityRequestDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class CityService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(regionId: number, request: CreateCityRequestDto) {
    const createdCity = await this.prismaService.city
      .create({
        data: {
          name: request.name
            .split(' ')
            .map((word) => word[0].toUpperCase() + word.slice(1))
            .join(' '),
          region: { connect: { id: regionId } },
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Invalid regionId');
          } else if (error.code == 'P2002') {
            throw new BadRequestException(
              "There's an existing city with that name for this region",
            );
          }
        }
        throw error;
      });

    return createdCity;
  }

  async getAll(regionId: number) {
    const regionWithCities = await this.prismaService.region
      .findUniqueOrThrow({
        where: { id: regionId },
        include: { cities: { select: { id: true, name: true } } },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Invalid regionId');
          }
        }
        throw error;
      });

    return { cities: regionWithCities.cities };
  }

  async getCount(regionId: number) {
    const citiesCount = await this.prismaService.region
      .findUniqueOrThrow({
        where: { id: regionId },
        select: { _count: { select: { cities: true } } },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Invalid regionId');
          }
        }
        throw error;
      });

    return { count: citiesCount._count.cities };
  }

  async getOneById(cityId: number) {
    const city = await this.prismaService.city
      .findUniqueOrThrow({
        where: { id: cityId },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('City was not found');
          }
        }
        throw error;
      });

    return city;
  }

  async update(cityId: number, request: UpdateCityRequestDto) {
    const city = await this.prismaService.city
      .findUniqueOrThrow({
        where: { id: cityId },
        include: { region: true },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('City was not found');
          }
        }
        throw error;
      });

    const updatedCity = await this.prismaService.city
      .update({
        where: { id: cityId },
        data: {
          name: request?.name
            ? request?.name
                .split(' ')
                .map((word) => word[0].toUpperCase() + word.slice(1))
                .join(' ')
            : city.name,
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2002') {
            throw new BadRequestException(
              `There's an existing city with that name for ${city.region.name} region`,
            );
          }
        }
        throw error;
      });

    return { message: 'City was updated successfully', city: updatedCity };
  }

  async delete(cityId: number) {
    const deletedCity = await this.prismaService.city
      .delete({
        where: { id: cityId },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('City was not found');
          }
        }
        throw error;
      });

    return {
      message: 'City was deleted successfully',
      city: deletedCity,
    };
  }
}
