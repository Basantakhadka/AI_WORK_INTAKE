import { Alert, Descriptions, Tag } from 'antd';
import { WorkItem } from '../types/work-item.types';

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'default',
  MEDIUM: 'gold',
  HIGH: 'red',
};

export function AIAnalysisCard({ item }: { item: WorkItem }) {
  if (item.status === 'FAILED' && item.aiError) {
    return <Alert type="error" showIcon message="AI analysis failed" description={item.aiError} />;
  }

  if (!item.analysedAt) {
    return <Alert type="info" showIcon message="This work item has not been analysed yet." />;
  }

  return (
    <Descriptions column={1} size="small" bordered>
      <Descriptions.Item label="Category">{item.category}</Descriptions.Item>
      <Descriptions.Item label="Priority">
        <Tag color={PRIORITY_COLORS[item.priority ?? '']}>{item.priority}</Tag>
      </Descriptions.Item>
      <Descriptions.Item label="Summary">{item.summary}</Descriptions.Item>
      <Descriptions.Item label="Recommended action">{item.recommendedAction}</Descriptions.Item>
      <Descriptions.Item label="Analysed at">
        {item.analysedAt ? new Date(item.analysedAt).toLocaleString() : '—'}
      </Descriptions.Item>
    </Descriptions>
  );
}
