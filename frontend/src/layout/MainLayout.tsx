import React, { useState } from 'react';
import { Layout, Menu, Button, theme, Breadcrumb } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    DashboardOutlined,
    DatabaseOutlined,
    TagsOutlined,
    HistoryOutlined,
    UserOutlined,
    LogoutOutlined,
    LineChartOutlined,
} from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const MainLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = user.role === 'ADMIN';

    const menuItems = [
        {
            key: '/dashboard',
            icon: <DashboardOutlined />,
            label: <Link to="/dashboard">控制台</Link>,
        },
        {
            key: '/goods',
            icon: <DatabaseOutlined />,
            label: <Link to="/goods">货物管理</Link>,
        },
        {
            key: '/categories',
            icon: <TagsOutlined />,
            label: <Link to="/categories">分类管理</Link>,
        },
        {
            key: '/records',
            icon: <HistoryOutlined />,
            label: <Link to="/records">出入库记录</Link>,
        },
        isAdmin && {
            key: '/users',
            icon: <UserOutlined />,
            label: <Link to="/users">用户管理</Link>,
        },
        isAdmin && {
            key: '/logs',
            icon: <LineChartOutlined />,
            label: <Link to="/logs">操作日志</Link>,
        },
    ].filter(Boolean) as any[];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider trigger={null} collapsible collapsed={collapsed} theme="light" className="shadow-md">
                <div className="flex items-center justify-center py-6">
                    <h1 className={`${collapsed ? 'hidden' : 'block'} text-xl font-bold text-blue-600`}>货物管理系统</h1>
                    <div className={`${collapsed ? 'block' : 'hidden'} text-xl font-bold text-blue-600`}>WMS</div>
                </div>
                <Menu
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                />
            </Sider>
            <Layout>
                <Header style={{ padding: 0, background: colorBgContainer }} className="flex justify-between items-center px-4 shadow-sm">
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{ fontSize: '16px', width: 64, height: 64 }}
                    />
                    <div className="flex items-center gap-4">
                        <span className="text-gray-600">欢迎, {JSON.parse(localStorage.getItem('user') || '{}').nickname || '管理员'}</span>
                        <Button type="link" icon={<LogoutOutlined />} onClick={handleLogout}>退出</Button>
                    </div>
                </Header>
                <Content style={{ margin: '16px', padding: 24, background: colorBgContainer, borderRadius: borderRadiusLG, overflow: 'initial' }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;
