import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CreateHistoryEntryRequestDto } from './dto';
import { User } from '@prisma/client';
import { AbilityFactory } from 'src/ability/ability.factory';
import { subject } from '@casl/ability';

@Injectable()
export class HistoryService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly abilityFactory: AbilityFactory,
  ) {}

  async createEntry(
    currentUser: User,
    customerId: number,
    request: CreateHistoryEntryRequestDto,
  ) {
    const ability = this.abilityFactory.defineAbilityFor(currentUser);

    const historyEntryToBeCreated = subject('History', {
      ...request,
      customerId,
    });

    if (!ability.can('create', historyEntryToBeCreated)) {
      throw new ForbiddenException(
        'Tried to create an unauthorized resource (History)',
      );
    }

    const createdEntry = await this.prismaService.history
      .create({
        data: {
          product: { connect: { id: request.productId } },
          customer: { connect: { id: customerId } },
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('Invalid productId');
          }
        }
        throw error;
      });

    return createdEntry;
  }

  async getAll(currentUser: User, customerId: number) {
    const ability = this.abilityFactory.defineAbilityFor(currentUser);

    const historyToBeRead = subject('History', {
      customerId,
    });

    if (!ability.can('read', historyToBeRead)) {
      throw new ForbiddenException(
        'Tried to read an unauthorized resource (History)',
      );
    }

    const history = await this.prismaService.history.findMany({
      where: { customerId },
      orderBy: { id: 'desc' },
    });

    return history;
  }
}
