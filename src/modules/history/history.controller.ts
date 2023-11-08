import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { HistoryService } from './history.service';
import { CreateHistoryEntryRequestDto } from './dto';
import { GetUser } from 'src/common/decorators';
import { User } from '@prisma/client';

@Controller('/customers/:customerId/history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Post()
  createEntry(
    @GetUser() currentUser: User,
    @Param('customerId', ParseIntPipe) customerId: number,
    @Body() request: CreateHistoryEntryRequestDto,
  ) {
    return this.historyService.createEntry(currentUser, customerId, request);
  }

  @Get()
  getAll(
    @GetUser() currentUser: User,
    @Param('customerId', ParseIntPipe) customerId: number,
  ) {
    return this.historyService.getAll(currentUser, customerId);
  }
}
