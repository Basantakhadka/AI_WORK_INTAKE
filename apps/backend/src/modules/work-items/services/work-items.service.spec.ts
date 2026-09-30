import { WorkItemStatus } from '../enums/work-item-status.enum';
import { WorkItemsService } from './work-items.service';
import { WorkflowService } from './workflow.service';

function buildService(aiAnalyse: jest.Mock) {
  const repository = {
    create: jest.fn(),
    findMany: jest.fn(),
    findById: jest.fn(),
    transition: jest.fn(),
    saveAnalysis: jest.fn(),
    markAIAsFailed: jest.fn(),
  };
  const aiService = { analyse: aiAnalyse };
  // Real WorkflowService so analyse()/retry() are gated by the actual
  // transition rules, not a stub that would rubber-stamp anything.
  const service = new WorkItemsService(repository as any, new WorkflowService(), aiService as any);
  return { service, repository, aiService };
}

describe('WorkItemsService', () => {
  const baseItem = {
    id: 'wi-1',
    externalId: 'CRM-1',
    title: 'Missing income document',
    description: 'The applicant has not provided their latest payslip.',
    status: WorkItemStatus.RECEIVED,
    aiAttempts: 0,
  };

  it('stores the AI result and moves the item to READY_FOR_REVIEW on success', async () => {
    const analysisResult = {
      category: 'DOCUMENT_REQUEST',
      priority: 'HIGH',
      summary: 'The applicant needs to provide their latest payslip.',
      recommendedAction: 'Request the missing payslip from the applicant.',
    };
    const { service, repository, aiService } = buildService(jest.fn().mockResolvedValue(analysisResult));

    const readyItem = { ...baseItem, ...analysisResult, status: WorkItemStatus.READY_FOR_REVIEW };
    repository.findById.mockResolvedValue(baseItem);
    repository.transition
      .mockResolvedValueOnce({ ...baseItem, status: WorkItemStatus.ANALYSING })
      .mockResolvedValueOnce(readyItem);
    repository.saveAnalysis.mockResolvedValue({ ...baseItem, ...analysisResult });

    const result = await service.analyse(baseItem.id);

    expect(aiService.analyse).toHaveBeenCalledWith({ title: baseItem.title, description: baseItem.description });
    expect(repository.saveAnalysis).toHaveBeenCalledWith(baseItem.id, analysisResult);
    expect(repository.markAIAsFailed).not.toHaveBeenCalled();
    expect(result).toEqual(readyItem);
  });

  it('marks the item FAILED and never persists a partial AI result when the provider fails', async () => {
    const { service, repository, aiService } = buildService(
      jest.fn().mockRejectedValue(new Error('AI provider returned malformed JSON.')),
    );

    const failedItem = { ...baseItem, status: WorkItemStatus.FAILED, aiError: 'AI provider returned malformed JSON.' };
    repository.findById.mockResolvedValueOnce(baseItem).mockResolvedValueOnce(failedItem);
    repository.transition.mockResolvedValue({ ...baseItem, status: WorkItemStatus.ANALYSING });
    repository.markAIAsFailed.mockResolvedValue(failedItem);

    const result = await service.analyse(baseItem.id);

    expect(aiService.analyse).toHaveBeenCalled();
    expect(repository.saveAnalysis).not.toHaveBeenCalled();
    expect(repository.markAIAsFailed).toHaveBeenCalledWith(baseItem.id, 'AI provider returned malformed JSON.');
    expect(result).toEqual(failedItem);
  });

  it('rejects retry unless the work item is currently FAILED', async () => {
    const { service, repository } = buildService(jest.fn());
    repository.findById.mockResolvedValue({ ...baseItem, status: WorkItemStatus.RECEIVED });

    await expect(service.retry(baseItem.id)).rejects.toThrow(
      'Retry is only allowed for work items in the FAILED status.',
    );
  });

  it('allows retry from FAILED and re-runs analysis', async () => {
    const analysisResult = {
      category: 'GENERAL_INQUIRY',
      priority: 'LOW',
      summary: 'summary',
      recommendedAction: 'action',
    };
    const failedItem = { ...baseItem, status: WorkItemStatus.FAILED, aiAttempts: 1 };
    const { service, repository, aiService } = buildService(jest.fn().mockResolvedValue(analysisResult));

    const readyItem = { ...failedItem, ...analysisResult, status: WorkItemStatus.READY_FOR_REVIEW };
    repository.findById.mockResolvedValue(failedItem);
    repository.transition
      .mockResolvedValueOnce({ ...failedItem, status: WorkItemStatus.ANALYSING })
      .mockResolvedValueOnce(readyItem);
    repository.saveAnalysis.mockResolvedValue({ ...failedItem, ...analysisResult });

    const result = await service.retry(failedItem.id);

    expect(aiService.analyse).toHaveBeenCalled();
    expect(result).toEqual(readyItem);
  });
});
