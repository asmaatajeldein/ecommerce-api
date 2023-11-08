import { SetMetadata } from '@nestjs/common';
import { AppActions, AppSubjects } from 'src/ability/ability.factory';

class AbilityType {
  action: AppActions;
  subject: AppSubjects;
  fields?: string[];
}

export const CheckAbility = (...abilities: AbilityType[]) =>
  SetMetadata('abilities', abilities);
