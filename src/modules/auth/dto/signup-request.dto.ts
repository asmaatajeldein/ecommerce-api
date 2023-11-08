import { $Enums } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsString,
  IsEmail,
  IsDateString,
  IsNotEmpty,
  IsIn,
} from 'class-validator';

export class SignupRequestDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @IsNotEmpty()
  @IsIn(Object.keys($Enums.Gender))
  gender: $Enums.Gender;

  @IsNotEmpty()
  @IsDateString()
  @Transform(({ value }) => new Date(value).toISOString())
  birthDate: Date;
}
