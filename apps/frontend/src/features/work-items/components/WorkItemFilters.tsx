import { useState } from 'react';
import { Button, Input, Select, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { WorkItemStatus } from '../types/work-item.types';

const STATUS_OPTIONS: WorkItemStatus[] = ['RECEIVED', 'ANALYSING', 'READY_FOR_REVIEW', 'COMPLETED', 'FAILED'];

interface Props {
  status?: WorkItemStatus;
  onStatusChange: (status?: WorkItemStatus) => void;
  search?: string;
  onSearch: (search?: string) => void;
  onCreate: () => void;
}

export function WorkItemFilters({ status, onStatusChange, search, onSearch, onCreate }: Props) {
  // Local draft text — only committed to the parent (and therefore the API
  // call) when the search button/Enter fires, not on every keystroke.
  const [draft, setDraft] = useState(search ?? '');

  return (
    <Space style={{ marginBottom: 16, justifyContent: 'space-between', width: '100%' }} wrap>
      <Space>
        <Input.Search
          allowClear
          placeholder="Search by external ID or title"
          style={{ width: 280 }}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onSearch={(value) => onSearch(value.trim() || undefined)}
        />
        <Select
          allowClear
          placeholder="Filter by status"
          style={{ width: 220 }}
          value={status}
          onChange={(value) => onStatusChange(value)}
          options={STATUS_OPTIONS.map((value) => ({ value, label: value.replace(/_/g, ' ') }))}
        />
      </Space>
      <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
        New work item
      </Button>
    </Space>
  );
}
