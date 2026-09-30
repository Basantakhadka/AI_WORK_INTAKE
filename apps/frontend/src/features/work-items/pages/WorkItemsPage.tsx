import { useState } from 'react';
import { Typography } from 'antd';
import { useWorkItemsQuery } from '../hooks/useWorkItems';
import { WorkItem, WorkItemStatus } from '../types/work-item.types';
import { WorkItemFilters } from '../components/WorkItemFilters';
import { WorkItemTable } from '../components/WorkItemTable';
import { WorkItemDetails } from '../components/WorkItemDetails';
import { CreateWorkItemModal } from '../components/CreateWorkItemModal';

export function WorkItemsPage() {
  const [status, setStatus] = useState<WorkItemStatus | undefined>(undefined);
  const [search, setSearch] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<WorkItem | undefined>(undefined);
  const [createOpen, setCreateOpen] = useState(false);

  const limit = 20;
  const { data, isLoading } = useWorkItemsQuery({ status, search, page, limit });

  return (
    <div style={{ padding: '32px 24px' }}>
      <Typography.Title level={3}>Work Items</Typography.Title>

      <WorkItemFilters
        status={status}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        search={search}
        onSearch={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onCreate={() => setCreateOpen(true)}
      />

      <WorkItemTable
        items={data?.items ?? []}
        loading={isLoading}
        total={data?.total ?? 0}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onSelect={setSelected}
      />

      <WorkItemDetails workItemId={selected?.id} onClose={() => setSelected(undefined)} />
      <CreateWorkItemModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
