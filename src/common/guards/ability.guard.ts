import { ForbiddenError } from '@casl/ability';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  AbilityFactory,
  AppActions,
  AppSubjects,
} from 'src/ability/ability.factory';

@Injectable()
export class AbilityGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly abilityFactory: AbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRules = this.reflector.getAllAndOverride<
      { action: AppActions; subject: AppSubjects; fields?: string[] }[]
    >('abilities', [context.getHandler(), context.getClass()]);

    if (!requiredRules) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    const ability = this.abilityFactory.defineAbilityFor(user);

    try {
      requiredRules.forEach((rule) => {
        if (!rule?.fields) {
          ForbiddenError.from(ability).throwUnlessCan(
            rule.action,
            rule.subject,
          );
        } else {
          rule.fields.forEach((field) => {
            ForbiddenError.from(ability).throwUnlessCan(
              rule.action,
              rule.subject,
              field,
            );
          });
        }
      });

      return true;
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
    }
  }
}
