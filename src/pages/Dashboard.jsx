// client/src/pages/Dashboard.jsx
import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Typography } from 'antd';
import {
  UploadOutlined,
  FileTextOutlined,
  LogoutOutlined,
  DashboardOutlined,
} from '@ant-design/icons';

const { Sider, Header, Content } = Layout;
const { Title } = Typography;

const Dashboard = ({ handleLogout }) => {
  const location = useLocation();

  const selectedKey = location.pathname.includes('upload')
    ? 'upload'
    : location.pathname.includes('list')
    ? 'list'
    : '';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sider breakpoint="lg" collapsedWidth="80" style={{ backgroundColor: '#001529' }}>
        <div className="logo" style={{ textAlign: 'center', padding: '24px 0', color: '#fff', fontSize: '20px', fontWeight: '600' }}>
          Admin Panel
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          style={{ fontSize: '16px' }}
        >
          <Menu.Item key="upload" icon={<UploadOutlined />}>
            <Link to="/dashboard/upload">Upload File</Link>
          </Menu.Item>
          <Menu.Item key="list" icon={<FileTextOutlined />}>
            <Link to="/dashboard/list">View Uploads</Link>
          </Menu.Item>
        </Menu>

        <div style={{ padding: '16px' }}>
          <Button
            type="primary"
            icon={<LogoutOutlined />}
            danger
            block
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </Sider>

      {/* Main Layout */}
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0' }}>
          <Title level={3} style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
            <DashboardOutlined style={{ marginRight: 8 }} />
            Admin Dashboard
          </Title>
        </Header>
        <Content style={{ padding: 5, background: '#fff', borderRadius: 8 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
