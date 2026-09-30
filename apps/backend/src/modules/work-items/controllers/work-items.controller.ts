import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { CreateWorkItemDto } from '../dto/create-work-item.dto';
import { QueryWorkItemsDto } from '../dto/query-work-items.dto';
import { UpdateStatusDto } from '../dto/update-status.dto';
import { WorkItemsService } from '../services/work-items.service';

@Controller('work-items')
export class WorkItemsController {
  constructor(private readonly workItemsService: WorkItemsService) {}

  @Post()
  create(@Body() dto: CreateWorkItemDto) {
    return this.workItemsService.create(dto);
  }

  @Get()
  findAll(@Query() query: QueryWorkItemsDto) {
    return this.workItemsService.findAll(query);
  }

  // Must come before ':id' — otherwise Express would match "stats" as the
  // :id param and ParseUUIDPipe would reject it with a 400.
  @Get('stats')
  getStats() {
    return this.workItemsService.getStats();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.workItemsService.findOne(id);
  }

  @Post(':id/analyse')
  analyse(@Param('id', ParseUUIDPipe) id: string) {
    return this.workItemsService.analyse(id);
  }

  @Post(':id/retry')
  retry(@Param('id', ParseUUIDPipe) id: string) {
    return this.workItemsService.retry(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateStatusDto) {
    return this.workItemsService.updateStatus(id, dto);
  }
}
