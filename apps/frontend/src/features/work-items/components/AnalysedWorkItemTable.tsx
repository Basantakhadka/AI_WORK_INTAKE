import { Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { WorkItem } from '../types/work-item.types';
import { StatusBadge } from './StatusBadge';

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'default',
  MEDIUM: 'gold',
  HIGH: 'red',
};

interface Props {
  items: WorkItem[];
  loading: boolean;
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onSelect: (item: WorkItem) => void;
}

const columns: ColumnsType<WorkItem> = [
  { title: 'External ID', dataIndex: 'externalId', key: 'externalId' },
  { title: 'Title', dataIndex: 'title', key: 'title', ellipsis: true },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status: WorkItem['status']) => <StatusBadge status={status} />,
  },
  { title: 'Category', dataIndex: 'category', key: 'category', render: (v) => v ?? '—' },
  {
    title: 'Priority',
    dataIndex: 'priority',
    key: 'priority',
    render: (v: string | null) => (v ? <Tag color={PRIORITY_COLORS[v]}>{v}</Tag> : '—'),
  },
  { title: 'Summary', dataIndex: 'summary', key: 'summary', ellipsis: true },
  {
    title: 'Analysed at',
    dataIndex: 'analysedAt',
    key: 'analysedAt',
    render: (value: string | null) => (value ? new Date(value).toLocaleString() : '—'),
  },
];

export function AnalysedWorkItemTable({ items, loading, total, page, limit, onPageChange, onSelect }: Props) {
  return (
    <Table
      rowKey="id"
      loading={loading}
      dataSource={items}
      columns={columns}
      onRow={(record) => ({ onClick: () => onSelect(record), style: { cursor: 'pointer' } })}
      pagination={{
        current: page,
        pageSize: limit,
        total,
        onChange: onPageChange,
        showSizeChanger: false,
      }}
    />
  );
}
