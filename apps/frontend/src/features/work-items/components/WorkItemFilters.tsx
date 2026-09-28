import { Button, Select, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { WorkItemStatus } from '../types/work-item.types';

const STATUS_OPTIONS: WorkItemStatus[] = ['RECEIVED', 'ANALYSING', 'READY_FOR_REVIEW', 'COMPLETED', 'FAILED'];

interface Props {
  status?: WorkItemStatus;
  onStatusChange: (status?: WorkItemStatus) => void;
  onCreate: () => void;
}

export function WorkItemFilters({ status, onStatusChange, onCreate }: Props) {
  return (
    <Space style={{ marginBottom: 16, justifyContent: 'space-between', width: '100%' }}>
      <Select
        allowClear
        placeholder="Filter by status"
        style={{ width: 220 }}
        value={status}
        onChange={(value) => onStatusChange(value)}
        options={STATUS_OPTIONS.map((value) => ({ value, label: value.replace(/_/g, ' ') }))}
      />
      <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
        New work item
      </Button>
    </Space>
  );
}
