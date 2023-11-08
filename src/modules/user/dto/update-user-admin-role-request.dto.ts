import { $Enums } from '@prisma/client';
import { IsIn, IsNotEmpty } from 'class-validator';

export class UpdateUserAdminRoleRequestDto {
  @IsNotEmpty()
  @IsIn([$Enums.Role.ADMIN, $Enums.Role.SUPERADMIN])
  role: $Enums.Role;
}
