import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { AIAnalysisResult } from '../../ai/interfaces/ai-provider.interface';
import { WorkItemStatusHistory } from '../entities/work-item-status-history.entity';
import { WorkItem } from '../entities/work-item.entity';
import { WorkItemStatus } from '../enums/work-item-status.enum';

const POSTGRES_UNIQUE_VIOLATION = '23505';

@Injectable()
export class WorkItemsRepository {
  constructor(
    @InjectRepository(WorkItem) private readonly workItems: Repository<WorkItem>,
    private readonly dataSource: DataSource,
  ) {}

  async create(data: { externalId: string; title: string; description: string }): Promise<WorkItem> {
    try {
      return await this.workItems.save(this.workItems.create(data));
    } catch (error) {
      // The unique constraint on external_id is the real safeguard against
      // duplicates; a find-then-create check in application code alone would
      // race under concurrent requests.
      if (error instanceof QueryFailedError && (error as { code?: string }).code === POSTGRES_UNIQUE_VIOLATION) {
        const existing = await this.workItems.findOne({ where: { externalId: data.externalId } });
        throw new ConflictException({
          message: `A work item with externalId "${data.externalId}" already exists.`,
          existingId: existing?.id,
        });
      }
      throw error;
    }
  }

  async findMany(params: { status?: WorkItemStatus; page: number; limit: number }) {
    const { status, page, limit } = params;

    const [items, total] = await this.workItems.findAndCount({
      where: status ? { status } : {},
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total, page, limit };
  }

  async findById(id: string): Promise<WorkItem> {
    const item = await this.workItems.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Work item ${id} not found.`);
    }
    return item;
  }

  async transition(id: string, toStatus: WorkItemStatus, reason?: string): Promise<WorkItem> {
    return this.dataSource.transaction(async (manager) => {
      const current = await manager.findOneOrFail(WorkItem, { where: { id } });

      await manager.update(WorkItem, { id }, { status: toStatus });

      await manager.insert(WorkItemStatusHistory, {
        workItemId: id,
        fromStatus: current.status,
        toStatus,
        reason,
      });

      return manager.findOneOrFail(WorkItem, { where: { id } });
    });
  }

  async saveAnalysis(id: string, result: AIAnalysisResult): Promise<WorkItem> {
    await this.workItems.update(
      { id },
      {
        category: result.category,
        priority: result.priority,
        summary: result.summary,
        recommendedAction: result.recommendedAction,
        aiError: null,
        analysedAt: new Date(),
      },
    );
    return this.findById(id);
  }

  async markAIAsFailed(id: string, errorMessage: string): Promise<WorkItem> {
    return this.dataSource.transaction(async (manager) => {
      const current = await manager.findOneOrFail(WorkItem, { where: { id } });

      await manager.update(WorkItem, { id }, { status: WorkItemStatus.FAILED, aiError: errorMessage });
      await manager.increment(WorkItem, { id }, 'aiAttempts', 1);

      await manager.insert(WorkItemStatusHistory, {
        workItemId: id,
        fromStatus: current.status,
        toStatus: WorkItemStatus.FAILED,
        reason: errorMessage,
      });

      return manager.findOneOrFail(WorkItem, { where: { id } });
    });
  }
}
