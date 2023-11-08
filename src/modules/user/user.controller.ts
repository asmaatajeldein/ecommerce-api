import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  UpdateUserPasswordRequestDto,
  UpdateUserInfoRequestDto,
  CreateUserAdminRequestDto,
  UpdateUserAdminRoleRequestDto,
} from './dto';
import { CheckAbility, GetUser } from 'src/common/decorators';
import { User } from '@prisma/client';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('admin')
  createAdmin(
    @GetUser() currentUser: User,
    request: CreateUserAdminRequestDto,
  ) {
    return this.userService.createAdmin(currentUser, request);
  }

  @Get('current')
  getCurrent(@GetUser() currentUser: User) {
    return this.userService.getCurrent(currentUser);
  }

  @CheckAbility({ action: 'read', subject: 'User' })
  @Get()
  getAll(@GetUser() currentUser: User) {
    return this.userService.getAll(currentUser);
  }

  @Get(':userId')
  getOneById(
    @GetUser() currentUser: User,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.userService.getOneById(currentUser, userId);
  }

  @Patch(':userId')
  updateUserInfo(
    @GetUser() currentUser: User,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() request: UpdateUserInfoRequestDto,
  ) {
    return this.userService.updateUserInfo(currentUser, userId, request);
  }

  @Patch('current/password')
  updateUserPassword(
    @GetUser() currentUser: User,
    @Body() request: UpdateUserPasswordRequestDto,
  ) {
    return this.userService.updateUserPassword(currentUser, request);
  }

  @CheckAbility({ action: 'update', subject: 'User', fields: ['role'] })
  @Patch('/admin/:userId')
  updateAdminRole(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() request: UpdateUserAdminRoleRequestDto,
  ) {
    return this.userService.updateAdminRole(userId, request);
  }

  @Delete(':userId')
  delete(
    @GetUser() currentUser: User,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.userService.delete(currentUser, userId);
  }
}
