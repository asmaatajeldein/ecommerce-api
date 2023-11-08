import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CreateCountryRequestDto, UpdateCountryRequestDto } from './dto';

@Injectable()
export class CountryService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(request: CreateCountryRequestDto) {
    const createdCountry = await this.prismaService.country
      .create({
        data: {
          name: request.name
            .split(' ')
            .map((word) => word[0].toUpperCase() + word.slice(1))
            .join(' '),
          code: request.code.toUpperCase(),
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if ((error.code = 'P2002')) {
            throw new BadRequestException(
              "There's an existing country with that name or code",
            );
          }
        }
        throw error;
      });

    return createdCountry;
  }

  async getAll() {
    const countries = await this.prismaService.country.findMany();

    return { countries };
  }

  async getOneByCountryCode(countryCode: string) {
    const country = await this.prismaService.country
      .findUniqueOrThrow({
        where: { code: countryCode },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Country was not found');
          }
        }
        throw error;
      });

    return country;
  }

  async getOneById(countryId: number) {
    const country = await this.prismaService.country
      .findUniqueOrThrow({
        where: { id: countryId },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Country was not found');
          }
        }
        throw error;
      });

    return country;
  }

  async update(countryId: number, request: UpdateCountryRequestDto) {
    const country = await this.prismaService.country
      .findUniqueOrThrow({ where: { id: countryId } })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Country was not found');
          }
        }
        throw error;
      });

    const updatedCountry = await this.prismaService.country
      .update({
        where: { id: countryId },
        data: {
          name: request.name
            ? request.name
                .split(' ')
                .map((word) => word[0].toUpperCase() + word.slice(1))
                .join(' ')
            : country.name,
          code: request.code ? request.code.toUpperCase() : country.code,
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2002') {
            throw new BadRequestException(
              "There's an existing country with that name or code",
            );
          }
        }
        throw error;
      });

    return {
      message: 'Country was updated successfully',
      country: updatedCountry,
    };
  }

  async delete(countryId: number) {
    const deletedCountry = await this.prismaService.country
      .delete({ where: { id: countryId } })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Country was not found');
          }
        }
        throw error;
      });

    return {
      message: 'Country was deleted successfully',
      country: deletedCountry,
    };
  }
}
