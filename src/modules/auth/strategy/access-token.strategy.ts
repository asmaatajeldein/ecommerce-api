import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/database/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { tokenPayload } from '../types/token-payload.type';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
  Strategy,
  'access-token-strategy',
) {
  constructor(
    configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('ACCESS_TOKEN_SECRET'),
    });
  }

  async validate(payload: tokenPayload) {
    const user = await this.prismaService.user
      .findUniqueOrThrow({
        where: { email: payload.email },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code == 'P2025') {
            throw new UnauthorizedException();
          }
        }
        throw error;
      });

    delete user.password;
    delete user.hashedRt;

    return user;
  }
}
