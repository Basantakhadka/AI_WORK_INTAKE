import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { workItemsApi } from '../services/work-items.api';
import { CreateWorkItemInput, WorkItem, WorkItemFilters } from '../types/work-item.types';

const workItemsKey = (filters: WorkItemFilters) => ['work-items', filters] as const;
const workItemKey = (id: string) => ['work-items', 'detail', id] as const;

export function useWorkItemsQuery(filters: WorkItemFilters) {
  return useQuery({
    queryKey: workItemsKey(filters),
    queryFn: () => workItemsApi.list(filters),
    placeholderData: (previous) => previous,
  });
}

export function useWorkItemQuery(id: string | undefined) {
  return useQuery({
    queryKey: workItemKey(id ?? ''),
    queryFn: () => workItemsApi.getById(id as string),
    enabled: Boolean(id),
  });
}

function useInvalidateWorkItems() {
  const queryClient = useQueryClient();
  return (id?: string) => {
    queryClient.invalidateQueries({ queryKey: ['work-items'] });
    if (id) {
      queryClient.invalidateQueries({ queryKey: workItemKey(id) });
    }
  };
}

export function useCreateWorkItemMutation() {
  const invalidate = useInvalidateWorkItems();
  return useMutation({
    mutationFn: (input: CreateWorkItemInput) => workItemsApi.create(input),
    onSuccess: () => invalidate(),
  });
}

export function useAnalyseMutation() {
  const invalidate = useInvalidateWorkItems();
  return useMutation({
    mutationFn: (id: string) => workItemsApi.analyse(id),
    onSuccess: (item: WorkItem) => invalidate(item.id),
  });
}

export function useRetryMutation() {
  const invalidate = useInvalidateWorkItems();
  return useMutation({
    mutationFn: (id: string) => workItemsApi.retry(id),
    onSuccess: (item: WorkItem) => invalidate(item.id),
  });
}

export function useUpdateStatusMutation() {
  const invalidate = useInvalidateWorkItems();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: WorkItem['status'] }) =>
      workItemsApi.updateStatus(id, status),
    onSuccess: (item: WorkItem) => invalidate(item.id),
  });
}
