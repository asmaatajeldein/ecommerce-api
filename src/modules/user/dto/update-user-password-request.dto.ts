import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserPasswordRequestDto {
  @IsNotEmpty()
  @IsString()
  currentPassword: string;

  @IsNotEmpty()
  @IsString()
  newPassword: string;
}
