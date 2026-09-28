import { Button, Space, message } from 'antd';
import { WorkItem } from '../types/work-item.types';
import { useAnalyseMutation, useRetryMutation, useUpdateStatusMutation } from '../hooks/useWorkItems';

export function ActionButtons({ item }: { item: WorkItem }) {
  const analyse = useAnalyseMutation();
  const retry = useRetryMutation();
  const updateStatus = useUpdateStatusMutation();

  const withErrorToast = (promise: Promise<unknown>) =>
    promise.catch((error) => {
      const description = error?.response?.data?.message ?? error.message ?? 'Request failed';
      message.error(Array.isArray(description) ? description.join(', ') : String(description));
    });

  return (
    <Space>
      {item.status === 'RECEIVED' && (
        <Button
          type="primary"
          loading={analyse.isPending}
          onClick={() => withErrorToast(analyse.mutateAsync(item.id))}
        >
          Analyse
        </Button>
      )}
      {item.status === 'FAILED' && (
        <Button loading={retry.isPending} onClick={() => withErrorToast(retry.mutateAsync(item.id))}>
          Retry
        </Button>
      )}
      {item.status === 'READY_FOR_REVIEW' && (
        <Button
          type="primary"
          loading={updateStatus.isPending}
          onClick={() => withErrorToast(updateStatus.mutateAsync({ id: item.id, status: 'COMPLETED' }))}
        >
          Complete
        </Button>
      )}
    </Space>
  );
}
