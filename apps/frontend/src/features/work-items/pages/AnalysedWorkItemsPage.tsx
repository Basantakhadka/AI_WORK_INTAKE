import { useState } from 'react';
import { Typography } from 'antd';
import { useWorkItemsQuery } from '../hooks/useWorkItems';
import { WorkItem } from '../types/work-item.types';
import { AnalysedWorkItemTable } from '../components/AnalysedWorkItemTable';
import { WorkItemDetails } from '../components/WorkItemDetails';

export function AnalysedWorkItemsPage() {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<WorkItem | undefined>(undefined);
  const limit = 20;

  const { data, isLoading } = useWorkItemsQuery({ analysed: true, page, limit });

  return (
    <div style={{ padding: '32px 24px' }}>
      <Typography.Title level={3}>Analysed Work Items</Typography.Title>
      <Typography.Paragraph type="secondary">
        Items that have gone through AI analysis at least once (READY_FOR_REVIEW or COMPLETED), with their
        results shown directly. Click a row for full details and actions.
      </Typography.Paragraph>

      <AnalysedWorkItemTable
        items={data?.items ?? []}
        loading={isLoading}
        total={data?.total ?? 0}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onSelect={setSelected}
      />

      <WorkItemDetails workItemId={selected?.id} onClose={() => setSelected(undefined)} />
    </div>
  );
}
