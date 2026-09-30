import { Card, Col, Row, Spin, Statistic, Typography } from 'antd';
import { useWorkItemStatsQuery } from '../hooks/useWorkItems';
import { WorkItemStatus } from '../types/work-item.types';

const STATUS_ORDER: WorkItemStatus[] = ['RECEIVED', 'ANALYSING', 'READY_FOR_REVIEW', 'COMPLETED', 'FAILED'];

const STATUS_LABELS: Record<WorkItemStatus, string> = {
  RECEIVED: 'Received',
  ANALYSING: 'Analysing',
  READY_FOR_REVIEW: 'Ready for review',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
};

// Same semantics as StatusBadge's Tag colors, as plain hex for Statistic's
// valueStyle (AntD's preset Tag color names aren't valid CSS color values).
const STATUS_HEX: Record<WorkItemStatus, string> = {
  RECEIVED: '#8c8c8c',
  ANALYSING: '#1677ff',
  READY_FOR_REVIEW: '#d4b106',
  COMPLETED: '#52c41a',
  FAILED: '#ff4d4f',
};

export function DashboardPage() {
  const { data, isLoading } = useWorkItemStatsQuery();

  return (
    <div style={{ padding: '32px 24px' }}>
      <Typography.Title level={3}>Dashboard</Typography.Title>
      <Typography.Paragraph type="secondary">
        Work item counts by status, live from the database.
      </Typography.Paragraph>

      {isLoading ? (
        <Spin />
      ) : (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card>
              <Statistic title="Total work items" value={data?.total ?? 0} />
            </Card>
          </Col>
          {STATUS_ORDER.map((status) => (
            <Col xs={24} sm={12} md={8} lg={4} key={status}>
              <Card>
                <Statistic
                  title={STATUS_LABELS[status]}
                  value={data?.byStatus[status] ?? 0}
                  valueStyle={{ color: STATUS_HEX[status] }}
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
