import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { StripeService } from 'src/stripe/stripe.service';
import {
  UpdateUserPasswordRequestDto,
  UpdateUserInfoRequestDto,
  CreateUserAdminRequestDto,
  UpdateUserAdminRoleRequestDto,
} from './dto';

import * as bcrypt from 'bcrypt';
import { Prisma, User } from '@prisma/client';
import { subject } from '@casl/ability';
import { AbilityFactory } from 'src/ability/ability.factory';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  private SALT_ROUNDS: number;

  constructor(
    readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
    private readonly stripeService: StripeService,
    private readonly abilityFactory: AbilityFactory,
  ) {
    this.SALT_ROUNDS = configService.get('SALT_ROUNDS');
  }

  private userSelect = Prisma.validator<Prisma.UserSelect>()({
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    phoneNumber: true,
    gender: true,
    birthDate: true,
    createdAt: true,
  });

  async createAdmin(currentUser: User, request: CreateUserAdminRequestDto) {
    const ability = this.abilityFactory.defineAbilityFor(currentUser);

    const userToBeCreated = subject('User', {
      role: request.role,
    });

    if (!ability.can('create', userToBeCreated)) {
      throw new ForbiddenException(
        'Tried to create an unauthorized resource (User)',
      );
    }

    const user = await this.prismaService.user.findUnique({
      where: { email: request.email, role: request.role },
    });

    if (user)
      throw new BadRequestException(
        `There is an existing admin account with that email with the role of '${user.role}'`,
      );

    const hashedPassword = await bcrypt.hash(
      request.password,
      this.SALT_ROUNDS,
    );

    const adminUser = await this.prismaService.user.create({
      data: {
        ...request,
        password: hashedPassword,
        customerId: null,
      },
    });

    return adminUser;
  }

  async getCurrent(currentUser: User) {
    const ability = this.abilityFactory.defineAbilityFor(currentUser);

    const userToBeRead = subject('User', {
      id: currentUser.id,
    });

    if (!ability.can('read', userToBeRead)) {
      throw new ForbiddenException(
        'Tried to read an unauthorized resource (User)',
      );
    }

    const user = await this.prismaService.user.findUnique({
      where: { id: currentUser.id },
      select: this.userSelect,
    });

    return user;
  }

  async getAll(currentUser: User) {
    const ability = this.abilityFactory.defineAbilityFor(currentUser);

    const userToBeRead = subject('User', {
      id: 2,
    });

    if (!ability.can('read', userToBeRead)) {
      throw new ForbiddenException(
        'Tried to read an unauthorized resource (User)',
      );
    }

    const users = await this.prismaService.user.findMany({
      select: this.userSelect,
    });

    return users;
  }

  async getOneById(currentUser: User, userId: number) {
    const ability = this.abilityFactory.defineAbilityFor(currentUser);

    const userToBeRead = subject('User', {
      id: userId,
    });

    if (!ability.can('read', userToBeRead)) {
      throw new ForbiddenException(
        'Tried to read an unauthorized resource (User)',
      );
    }

    const user = await this.prismaService.user
      .findUniqueOrThrow({
        where: { id: userId },
        select: this.userSelect,
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('User was not found');
          }
        }
        throw error;
      });

    return user;
  }

  async updateUserInfo(
    currentUser: User,
    userId: number,
    request: UpdateUserInfoRequestDto,
  ) {
    const ability = this.abilityFactory.defineAbilityFor(currentUser);

    const userToBeUpdated = subject('UserInfo', {
      id: userId,
    });

    if (!ability.can('update', userToBeUpdated)) {
      throw new ForbiddenException(
        'Tried to update an unauthorized resource (User)',
      );
    }

    const updatedUser = await this.prismaService.user
      .update({
        where: { id: currentUser.id },
        data: { ...request },
        select: this.userSelect,
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('User was not found');
          }
        }
        throw error;
      });

    return { message: 'User info was updated successfully', user: updatedUser };
  }

  async updateUserPassword(
    currentUser: User,
    request: UpdateUserPasswordRequestDto,
  ) {
    const ability = this.abilityFactory.defineAbilityFor(currentUser);

    const userToBeUpdated = subject('User', {
      id: currentUser.id,
      password: '12345',
    });

    if (!ability.can('update', userToBeUpdated, 'password')) {
      throw new ForbiddenException(
        'Tried to update an unauthorized resource (User)',
      );
    }

    const user = await this.prismaService.user.findUnique({
      where: { id: currentUser.id },
    });

    const currentPasswordMatches = await bcrypt.compare(
      request.currentPassword,
      user.password,
    );

    if (!currentPasswordMatches) {
      throw new ForbiddenException('Current password is incorrect');
    }

    const newPasswordHashed = await bcrypt.hash(
      request.newPassword,
      this.SALT_ROUNDS,
    );

    const updatedUser = await this.prismaService.user.update({
      where: { id: currentUser.id },
      data: { password: newPasswordHashed },
      select: this.userSelect,
    });

    return { message: 'Password was updated successfully', user: updatedUser };
  }

  async updateAdminRole(
    userId: number,
    request: UpdateUserAdminRoleRequestDto,
  ) {
    const updatedUser = await this.prismaService.user.update({
      where: { id: userId, role: { in: ['ADMIN', 'SUPERADMIN'] } },
      data: { role: request.role },
      select: this.userSelect,
    });

    return { message: 'Role was updated successfully', user: updatedUser };
  }

  async delete(currentUser: User, userId: number) {
    const ability = this.abilityFactory.defineAbilityFor(currentUser);

    const userToBeDeleted = subject('User', {
      id: userId,
    });

    if (!ability.can('delete', userToBeDeleted)) {
      throw new ForbiddenException(
        'Tried to delete an unauthorized resource (User)',
      );
    }

    const user = await this.prismaService.user
      .findUniqueOrThrow({
        where: { id: userId },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new NotFoundException('User was not found');
          }
        }
        throw error;
      });

    if (user.role === 'CUSTOMER') {
      const customer = await this.prismaService.customer.findUnique({
        where: { id: user.customerId },
      });

      this.stripeService.deleteCustomer(customer.stripeCustomerId);
    }

    const deletedUser = await this.prismaService.user.delete({
      where: { id: userId },
      select: this.userSelect,
    });

    return { message: 'User was deleted successfully', user: deletedUser };
  }
}
