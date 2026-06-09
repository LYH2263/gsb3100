import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, Tag, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../api/request';

const Users: React.FC = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/users') as any;
            setData(res);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = (id: number) => {
        Modal.confirm({
            title: '确认删除',
            content: '确定要删除该用户吗？',
            okText: '确认',
            cancelText: '取消',
            okType: 'danger',
            onOk: async () => {
                await api.delete(`/users/${id}`) as any;
                message.success('删除成功');
                fetchData();
            },
        });
    };

    const handleOk = async () => {
        const values = await form.validateFields();
        await api.post('/users', { ...values, password: '123456' }) as any; // Default password
        message.success('添加成功');
        setIsModalOpen(false);
        fetchData();
    };

    const columns = [
        { title: '用户名', dataIndex: 'username', key: 'username' },
        { title: '昵称', dataIndex: 'nickname', key: 'nickname' },
        {
            title: '角色',
            dataIndex: 'role',
            key: 'role',
            render: (role: string) => (
                <Tag color={role === 'ADMIN' ? 'gold' : 'blue'}>
                    {role === 'ADMIN' ? '管理员' : '普通用户'}
                </Tag>
            )
        },
        { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', render: (val: string) => val?.replace('T', ' ') },
        {
            title: '操作',
            key: 'action',
            render: (_: any, record: any) => (
                <Space size="middle">
                    {record.username !== 'admin' && (
                        <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>删除</Button>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">用户管理</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>新增用户</Button>
            </div>
            <Table columns={columns} dataSource={data} rowKey="id" loading={loading} className="shadow-sm" />

            <Modal
                title="新增用户"
                open={isModalOpen}
                onOk={handleOk}
                onCancel={() => setIsModalOpen(false)}
                destroyOnClose
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="nickname" label="昵称" rules={[{ required: true, message: '请输入昵称' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="role" label="角色" initialValue="USER">
                        <Select options={[{ label: '管理员', value: 'ADMIN' }, { label: '普通用户', value: 'USER' }]} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Users;
