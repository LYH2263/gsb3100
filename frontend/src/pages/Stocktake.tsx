import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, message, Tag, Card, Row, Col } from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    SearchOutlined,
    ReloadOutlined,
    EyeOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../api/request';

const Stocktake: React.FC = () => {
    const [data, setData] = useState([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = user.role === 'ADMIN';

    const fetchData = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (statusFilter) params.status = statusFilter;
            const res = await api.get('/stocktakes', { params }) as any;
            setData(res);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        const res = await api.get('/categories') as any;
        setCategories(res);
    };

    useEffect(() => {
        fetchData();
        fetchCategories();
    }, [statusFilter]);

    const handleAdd = () => {
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleOk = async () => {
        const values = await form.validateFields();
        try {
            await api.post('/stocktakes', values) as any;
            message.success('盘点单创建成功');
            setIsModalOpen(false);
            fetchData();
        } catch (e) {
            // error handled by interceptor
        }
    };

    const handleDelete = (record: any) => {
        Modal.confirm({
            title: '确认删除',
            content: `确定要删除盘点单「${record.title}」吗？`,
            okText: '确认',
            cancelText: '取消',
            okType: 'danger',
            onOk: async () => {
                await api.delete(`/stocktakes/${record.id}`) as any;
                message.success('删除成功');
                fetchData();
            },
        });
    };

    const handleConfirm = (record: any) => {
        Modal.confirm({
            title: '确认盘点',
            content: '确认后将根据实盘与基准差异调整库存，此操作不可撤销。确认继续？',
            okText: '确认盘点',
            cancelText: '取消',
            okType: 'primary',
            onOk: async () => {
                try {
                    await api.post(`/stocktakes/${record.id}/confirm`) as any;
                    message.success('盘点确认成功，库存已调整');
                    fetchData();
                } catch (e) {
                    // error handled by interceptor
                }
            },
        });
    };

    const columns = [
        {
            title: '标题',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: '分类筛选',
            dataIndex: 'categoryId',
            key: 'categoryId',
            render: (id: number | null) => id ? categories.find(c => c.id === id)?.name || '未知' : '全部分类',
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'DRAFT' ? 'orange' : 'green'}>
                    {status === 'DRAFT' ? '草稿' : '已确认'}
                </Tag>
            ),
        },
        {
            title: '创建人',
            dataIndex: 'creatorName',
            key: 'creatorName',
        },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (val: string) => val?.replace('T', ' '),
        },
        {
            title: '确认人',
            dataIndex: 'confirmerName',
            key: 'confirmerName',
            render: (val: string) => val || '-',
        },
        {
            title: '确认时间',
            dataIndex: 'confirmedAt',
            key: 'confirmedAt',
            render: (val: string) => val ? val.replace('T', ' ') : '-',
        },
        {
            title: '操作',
            key: 'action',
            width: 280,
            render: (_: any, record: any) => (
                <Space size="small">
                    <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => navigate(`/stocktakes/${record.id}`)}>
                        查看
                    </Button>
                    {record.status === 'DRAFT' && isAdmin && (
                        <Button type="link" size="small" style={{ color: '#52c41a' }} onClick={() => handleConfirm(record)}>
                            确认盘点
                        </Button>
                    )}
                    {record.status === 'DRAFT' && (
                        <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
                            删除
                        </Button>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div className="space-y-4">
            <Card bordered={false} className="shadow-sm mb-4">
                <Row gutter={16} align="middle">
                    <Col span={6}>
                        <Select
                            placeholder="按状态筛选"
                            className="w-full"
                            allowClear
                            value={statusFilter}
                            onChange={val => setStatusFilter(val)}
                            options={[
                                { label: '草稿', value: 'DRAFT' },
                                { label: '已确认', value: 'CONFIRMED' },
                            ]}
                        />
                    </Col>
                    <Col span={18} className="flex justify-end gap-2">
                        <Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button>
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>创建盘点单</Button>
                    </Col>
                </Row>
            </Card>

            <Table
                columns={columns}
                dataSource={data}
                rowKey="id"
                loading={loading}
                className="shadow-sm"
            />

            <Modal
                title="创建盘点单"
                open={isModalOpen}
                onOk={handleOk}
                onCancel={() => setIsModalOpen(false)}
                destroyOnClose
                width={500}
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Form.Item name="title" label="盘点标题" rules={[{ required: true, message: '请输入盘点标题' }]}>
                        <Input placeholder="如：2024年第一季度盘点" />
                    </Form.Item>
                    <Form.Item name="categoryId" label="按分类筛选">
                        <Select
                            placeholder="全部分类（不选则盘点所有货物）"
                            allowClear
                            options={categories.map(c => ({ label: c.name, value: c.id }))}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Stocktake;
