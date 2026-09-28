import { ConflictException, Injectable } from '@nestjs/common';
import { WorkItemStatus } from '../enums/work-item-status.enum';

const ALLOWED_TRANSITIONS: Record<WorkItemStatus, WorkItemStatus[]> = {
  [WorkItemStatus.RECEIVED]: [WorkItemStatus.ANALYSING],
  [WorkItemStatus.ANALYSING]: [WorkItemStatus.READY_FOR_REVIEW, WorkItemStatus.FAILED],
  [WorkItemStatus.FAILED]: [WorkItemStatus.ANALYSING],
  [WorkItemStatus.READY_FOR_REVIEW]: [WorkItemStatus.COMPLETED],
  [WorkItemStatus.COMPLETED]: [],
};

/**
 * Single source of truth for the work item state machine. The frontend may
 * hide actions that are not allowed, but only this guard decides whether a
 * transition is actually accepted.
 */
@Injectable()
export class WorkflowService {
  assertTransition(from: WorkItemStatus, to: WorkItemStatus): void {
    if (!ALLOWED_TRANSITIONS[from]?.includes(to)) {
      throw new ConflictException(`Cannot transition work item from ${from} to ${to}.`);
    }
  }

  assertCanAnalyse(status: WorkItemStatus): void {
    this.assertTransition(status, WorkItemStatus.ANALYSING);
  }

  assertCanRetry(status: WorkItemStatus): void {
    if (status !== WorkItemStatus.FAILED) {
      throw new ConflictException('Retry is only allowed for work items in the FAILED status.');
    }
  }
}
