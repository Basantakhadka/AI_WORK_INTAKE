import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiModule } from '../ai/ai.module';
import { WorkItemsController } from './controllers/work-items.controller';
import { WorkItemStatusHistory } from './entities/work-item-status-history.entity';
import { WorkItem } from './entities/work-item.entity';
import { WorkItemsRepository } from './repositories/work-items.repository';
import { WorkItemsService } from './services/work-items.service';
import { WorkflowService } from './services/workflow.service';

@Module({
  imports: [AiModule, TypeOrmModule.forFeature([WorkItem, WorkItemStatusHistory])],
  controllers: [WorkItemsController],
  providers: [WorkItemsService, WorkItemsRepository, WorkflowService],
})
export class WorkItemsModule {}
