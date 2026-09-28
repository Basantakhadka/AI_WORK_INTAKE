import { Injectable, Logger } from '@nestjs/common';
import { AIService } from '../../ai/ai.service';
import { normalizeAIError } from '../../ai/utils/normalize-ai-error';
import { CreateWorkItemDto } from '../dto/create-work-item.dto';
import { QueryWorkItemsDto } from '../dto/query-work-items.dto';
import { UpdateStatusDto } from '../dto/update-status.dto';
import { WorkItem } from '../entities/work-item.entity';
import { WorkItemStatus } from '../enums/work-item-status.enum';
import { WorkItemsRepository } from '../repositories/work-items.repository';
import { WorkflowService } from './workflow.service';

@Injectable()
export class WorkItemsService {
  private readonly logger = new Logger(WorkItemsService.name);

  constructor(
    private readonly repository: WorkItemsRepository,
    private readonly workflow: WorkflowService,
    private readonly aiService: AIService,
  ) {}

  create(dto: CreateWorkItemDto): Promise<WorkItem> {
    return this.repository.create(dto);
  }

  findAll(query: QueryWorkItemsDto) {
    return this.repository.findMany(query);
  }

  findOne(id: string): Promise<WorkItem> {
    return this.repository.findById(id);
  }

  /** RECEIVED -> ANALYSING -> (READY_FOR_REVIEW | FAILED) */
  async analyse(id: string): Promise<WorkItem> {
    const item = await this.repository.findById(id);
    this.workflow.assertCanAnalyse(item.status);
    return this.runAnalysis(item);
  }

  /** FAILED -> ANALYSING -> (READY_FOR_REVIEW | FAILED), only for previously failed items */
  async retry(id: string): Promise<WorkItem> {
    const item = await this.repository.findById(id);
    this.workflow.assertCanRetry(item.status);
    return this.runAnalysis(item);
  }

  async updateStatus(id: string, dto: UpdateStatusDto): Promise<WorkItem> {
    const item = await this.repository.findById(id);
    this.workflow.assertTransition(item.status, dto.status);
    return this.repository.transition(id, dto.status, dto.reason);
  }

  private async runAnalysis(item: WorkItem): Promise<WorkItem> {
    await this.repository.transition(item.id, WorkItemStatus.ANALYSING);

    try {
      const result = await this.aiService.analyse({
        title: item.title,
        description: item.description,
      });

      await this.repository.saveAnalysis(item.id, result);
      return this.repository.transition(item.id, WorkItemStatus.READY_FOR_REVIEW);
    } catch (error) {
      this.logger.warn(`AI analysis failed for work item ${item.id}: ${normalizeAIError(error)}`);
      await this.repository.markAIAsFailed(item.id, normalizeAIError(error));
      return this.repository.findById(item.id);
    }
  }
}
