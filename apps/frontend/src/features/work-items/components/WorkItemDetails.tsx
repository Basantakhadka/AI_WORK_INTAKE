import { Descriptions, Drawer, Divider } from 'antd';
import { useWorkItemQuery } from '../hooks/useWorkItems';
import { ActionButtons } from './ActionButtons';
import { AIAnalysisCard } from './AIAnalysisCard';
import { StatusBadge } from './StatusBadge';

interface Props {
  workItemId: string | undefined;
  onClose: () => void;
}

export function WorkItemDetails({ workItemId, onClose }: Props) {
  const { data: item, isLoading } = useWorkItemQuery(workItemId);

  return (
    <Drawer
      title={item ? item.title : 'Work item'}
      open={Boolean(workItemId)}
      onClose={onClose}
      width={480}
      loading={isLoading}
    >
      {item && (
        <>
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="External ID">{item.externalId}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <StatusBadge status={item.status} />
            </Descriptions.Item>
            <Descriptions.Item label="Description">{item.description}</Descriptions.Item>
            <Descriptions.Item label="AI attempts">{item.aiAttempts}</Descriptions.Item>
          </Descriptions>

          <Divider>AI analysis</Divider>
          <AIAnalysisCard item={item} />

          <Divider>Actions</Divider>
          <ActionButtons item={item} />
        </>
      )}
    </Drawer>
  );
}
