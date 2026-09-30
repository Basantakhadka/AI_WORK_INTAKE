import { Tag } from 'antd';
import { WorkItemStatus } from '../types/work-item.types';

export const STATUS_COLORS: Record<WorkItemStatus, string> = {
  RECEIVED: 'default',
  ANALYSING: 'processing',
  READY_FOR_REVIEW: 'gold',
  COMPLETED: 'success',
  FAILED: 'error',
};

export function StatusBadge({ status }: { status: WorkItemStatus }) {
  return <Tag color={STATUS_COLORS[status]}>{status.replace(/_/g, ' ')}</Tag>;
}
