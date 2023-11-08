import {
  ForbiddenException,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { LoginRequestDto, SignupRequestDto } from './dto';
import { PrismaService } from 'src/database/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { StripeService } from 'src/stripe/stripe.service';
import { Tokens } from './types';

import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private SALT_ROUNDS: number;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly stripeService: StripeService,
  ) {
    this.SALT_ROUNDS = configService.get('SALT_ROUNDS');
  }

  /* Signing up using credentials aka email and password */
  async customerSignup(request: SignupRequestDto): Promise<Tokens> {
    const emailExists = await this.prismaService.user.findUnique({
      where: { email: request.email, role: 'CUSTOMER' },
    });

    if (emailExists)
      throw new BadRequestException(
        'There is an existing customer account with that email',
      );

    const hashedPassword = await bcrypt.hash(
      request.password,
      this.SALT_ROUNDS,
    );

    const stripeCustomer = await this.stripeService.createCustomer(
      `${request.firstName} ${request.lastName}`,
      request.email,
    );

    const customerUser = await this.prismaService.user.create({
      data: {
        ...request,
        password: hashedPassword,
        role: 'CUSTOMER',
        customer: { create: { stripeCustomerId: stripeCustomer.id } },
      },
    });

    const tokens = await this.getTokens(customerUser.id, request.email);
    this.updateRefreshTokenHash(customerUser.id, tokens.refresh_token);

    return tokens;
  }

  async customerLogin(request: LoginRequestDto): Promise<Tokens> {
    const user = await this.prismaService.user
      .findUniqueOrThrow({
        where: { email: request.email, role: 'CUSTOMER' },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new ForbiddenException('Invalid credentials');
          }
        }
        throw error;
      });

    // check if the password matches the one that exists in the database
    const pwdMatches = await bcrypt.compare(request.password, user.password);
    if (!pwdMatches) throw new ForbiddenException('Invalid credentials');

    const tokens = await this.getTokens(user.id, user.email);
    this.updateRefreshTokenHash(user.id, tokens.refresh_token);

    return tokens;
  }

  async customerLogout(currentUserId: number) {
    await this.prismaService.user
      .findUniqueOrThrow({
        where: { id: currentUserId, role: 'CUSTOMER', hashedRt: { not: null } },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new BadRequestException('Customer is already logged out');
          }
        }
        throw error;
      });

    await this.prismaService.user.update({
      where: { id: currentUserId, role: 'CUSTOMER', hashedRt: { not: null } },
      data: {
        hashedRt: null,
      },
    });

    return { message: 'Customer was logged out successfully' };
  }

  async adminLogin(request: LoginRequestDto): Promise<Tokens> {
    const user = await this.prismaService.user
      .findUniqueOrThrow({
        where: { email: request.email, role: { in: ['ADMIN', 'SUPERADMIN'] } },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new ForbiddenException('Invalid credentials');
          }
        }
        throw error;
      });

    // check if the password matches the one that exists in the database
    const pwdMatches = await bcrypt.compare(request.password, user.password);
    if (!pwdMatches) throw new ForbiddenException('Invalid credentials');

    const tokens = await this.getTokens(user.id, user.email);
    this.updateRefreshTokenHash(user.id, tokens.refresh_token);

    return tokens;
  }

  async adminLogout(currentUserId: number) {
    const admin = await this.prismaService.user
      .findUniqueOrThrow({
        where: {
          id: currentUserId,
          role: { in: ['ADMIN', 'SUPERADMIN'] },
          hashedRt: { not: null },
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new BadRequestException('Admin is already logged out');
          }
        }
        throw error;
      });

    await this.prismaService.user.update({
      where: { id: currentUserId, role: admin.role, hashedRt: { not: null } },
      data: {
        hashedRt: null,
      },
    });

    return { message: 'Admin was logged out successfully' };
  }

  async refreshTokens(
    currentUserId: number,
    refreshToken: string,
  ): Promise<Tokens> {
    const user = await this.prismaService.user.findUnique({
      where: { id: currentUserId },
    });

    if (!user || !user.hashedRt) throw new ForbiddenException('Access denied');

    const rtMatches = await bcrypt.compare(refreshToken, user.hashedRt);

    if (!rtMatches) throw new ForbiddenException('Access denied');

    const newTokens = await this.getTokens(currentUserId, user.email);
    this.updateRefreshTokenHash(currentUserId, newTokens.refresh_token);

    return newTokens;
  }

  /*** Utility Functions ***/

  /***
   * Updates the refresh token for the logged in user
   ***/
  async updateRefreshTokenHash(currentUserId: number, rt: string) {
    const hashedRt = await bcrypt.hash(rt, this.SALT_ROUNDS);
    await this.prismaService.user.update({
      where: { id: currentUserId },
      data: { hashedRt },
    });
  }

  /***
   * Generates access and refresh tokens for the user
   ***/
  async getTokens(currentUserId: number, email: string): Promise<Tokens> {
    const payload = { sub: currentUserId, email };

    const [accessToken, refreshToken] = await Promise.all([
      await this.jwtService.signAsync(payload, {
        secret: this.configService.get('ACCESS_TOKEN_SECRET'),
        expiresIn: '15m',
      }),
      await this.jwtService.signAsync(payload, {
        secret: this.configService.get('REFRESH_TOKEN_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return { access_token: accessToken, refresh_token: refreshToken };
  }
}
