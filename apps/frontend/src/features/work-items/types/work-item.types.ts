export type WorkItemStatus = 'RECEIVED' | 'ANALYSING' | 'READY_FOR_REVIEW' | 'COMPLETED' | 'FAILED';

export type AIPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface WorkItem {
  id: string;
  externalId: string;
  title: string;
  description: string;
  status: WorkItemStatus;
  category: string | null;
  priority: AIPriority | null;
  summary: string | null;
  recommendedAction: string | null;
  aiError: string | null;
  aiAttempts: number;
  analysedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkItemListResponse {
  items: WorkItem[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateWorkItemInput {
  externalId: string;
  title: string;
  description: string;
}

export interface WorkItemFilters {
  status?: WorkItemStatus;
  page: number;
  limit: number;
}
