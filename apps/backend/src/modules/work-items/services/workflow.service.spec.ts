import { ConflictException } from '@nestjs/common';
import { WorkItemStatus } from '../enums/work-item-status.enum';
import { WorkflowService } from './workflow.service';

describe('WorkflowService', () => {
  let workflow: WorkflowService;

  beforeEach(() => {
    workflow = new WorkflowService();
  });

  describe('assertTransition', () => {
    it.each([
      [WorkItemStatus.RECEIVED, WorkItemStatus.ANALYSING],
      [WorkItemStatus.ANALYSING, WorkItemStatus.READY_FOR_REVIEW],
      [WorkItemStatus.ANALYSING, WorkItemStatus.FAILED],
      [WorkItemStatus.READY_FOR_REVIEW, WorkItemStatus.COMPLETED],
      [WorkItemStatus.FAILED, WorkItemStatus.ANALYSING],
    ])('allows %s -> %s', (from, to) => {
      expect(() => workflow.assertTransition(from, to)).not.toThrow();
    });

    it.each([
      [WorkItemStatus.RECEIVED, WorkItemStatus.COMPLETED],
      [WorkItemStatus.RECEIVED, WorkItemStatus.READY_FOR_REVIEW],
      [WorkItemStatus.COMPLETED, WorkItemStatus.ANALYSING],
      [WorkItemStatus.COMPLETED, WorkItemStatus.RECEIVED],
      [WorkItemStatus.READY_FOR_REVIEW, WorkItemStatus.ANALYSING],
      [WorkItemStatus.FAILED, WorkItemStatus.COMPLETED],
    ])('rejects %s -> %s', (from, to) => {
      expect(() => workflow.assertTransition(from, to)).toThrow(ConflictException);
    });
  });

  describe('assertCanRetry', () => {
    it('allows retry from FAILED', () => {
      expect(() => workflow.assertCanRetry(WorkItemStatus.FAILED)).not.toThrow();
    });

    it.each([
      WorkItemStatus.RECEIVED,
      WorkItemStatus.ANALYSING,
      WorkItemStatus.READY_FOR_REVIEW,
      WorkItemStatus.COMPLETED,
    ])('rejects retry from %s', (status) => {
      expect(() => workflow.assertCanRetry(status)).toThrow(ConflictException);
    });
  });
});
