import { apiClient } from '../../../api/client';
import {
  CreateWorkItemInput,
  WorkItem,
  WorkItemFilters,
  WorkItemListResponse,
} from '../types/work-item.types';

export const workItemsApi = {
  list: async (filters: WorkItemFilters): Promise<WorkItemListResponse> => {
    const { data } = await apiClient.get<WorkItemListResponse>('/work-items', {
      params: {
        status: filters.status,
        page: filters.page,
        limit: filters.limit,
      },
    });
    return data;
  },

  getById: async (id: string): Promise<WorkItem> => {
    const { data } = await apiClient.get<WorkItem>(`/work-items/${id}`);
    return data;
  },

  create: async (input: CreateWorkItemInput): Promise<WorkItem> => {
    const { data } = await apiClient.post<WorkItem>('/work-items', input);
    return data;
  },

  analyse: async (id: string): Promise<WorkItem> => {
    const { data } = await apiClient.post<WorkItem>(`/work-items/${id}/analyse`);
    return data;
  },

  retry: async (id: string): Promise<WorkItem> => {
    const { data } = await apiClient.post<WorkItem>(`/work-items/${id}/retry`);
    return data;
  },

  updateStatus: async (id: string, status: WorkItem['status']): Promise<WorkItem> => {
    const { data } = await apiClient.patch<WorkItem>(`/work-items/${id}/status`, { status });
    return data;
  },
};
