import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, Layout, Menu, Typography } from 'antd';
import { CheckCircleOutlined, DashboardOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { WorkItemsPage } from './features/work-items/pages/WorkItemsPage';
import { DashboardPage } from './features/work-items/pages/DashboardPage';
import { AnalysedWorkItemsPage } from './features/work-items/pages/AnalysedWorkItemsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

type NavKey = 'dashboard' | 'work-items' | 'analysed';

const NAV_ITEMS = [
  { key: 'dashboard' as const, icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: 'work-items' as const, icon: <UnorderedListOutlined />, label: 'Work Items' },
  { key: 'analysed' as const, icon: <CheckCircleOutlined />, label: 'Analysed Items' },
];

function renderPage(key: NavKey) {
  switch (key) {
    case 'dashboard':
      return <DashboardPage />;
    case 'analysed':
      return <AnalysedWorkItemsPage />;
    case 'work-items':
    default:
      return <WorkItemsPage />;
  }
}

function Shell() {
  const [active, setActive] = useState<NavKey>('dashboard');

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Sider width={220} theme="light" style={{ borderRight: '1px solid #f0f0f0' }}>
        <div style={{ padding: '20px 16px' }}>
          <Typography.Title level={5} style={{ margin: 0 }}>
            AI Work Intake
          </Typography.Title>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[active]}
          onClick={({ key }) => setActive(key as NavKey)}
          items={NAV_ITEMS}
        />
      </Layout.Sider>
      <Layout.Content style={{ background: '#fff', overflow: 'auto' }}>{renderPage(active)}</Layout.Content>
    </Layout>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={{ token: { colorPrimary: '#1677ff' } }}>
        <Shell />
      </ConfigProvider>
    </QueryClientProvider>
  );
}
