import React, { useEffect, useState } from 'react';
import {
    Table,
    Button,
    Space,
    Modal,
    Form,
    Select,
    Input,
    InputNumber,
    message,
    Row,
    Col,
    Card,
    Tag,
    Descriptions,
    Divider
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    ReloadOutlined,
    EyeOutlined,
    CheckOutlined,
    EditOutlined
} from '@ant-design/icons';
import api from '../api/request';

const StocktakePage: React.FC = () => {
    const [data, setData] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isEntryMode, setIsEntryMode] = useState(false);
    const [currentOrder, setCurrentOrder] = useState<any>(null);
    const [orderItems, setOrderItems] = useState<any[]>([]);
    const [itemsLoading, setItemsLoading] = useState(false);
    const [createForm] = Form.useForm();

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = user.role === 'ADMIN';

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/stocktake') as any;
            setData(res.sort((a: any, b: any) => b.id - a.id));
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
    }, []);

    const fetchOrderItems = async (orderId: number) => {
        setItemsLoading(true);
        try {
            const res = await api.get(`/stocktake/${orderId}/items`) as any;
            setOrderItems(res);
        } finally {
            setItemsLoading(false);
        }
    };

    const handleCreate = () => {
        createForm.resetFields();
        setIsCreateModalOpen(true);
    };

    const handleCreateOk = async () => {
        const values = await createForm.validateFields();
        await api.post('/stocktake', values);
        message.success('创建成功');
        setIsCreateModalOpen(false);
        fetchData();
    };

    const handleView = async (record: any) => {
        setCurrentOrder(record);
        setIsEntryMode(false);
        setIsDetailModalOpen(true);
        fetchOrderItems(record.id);
    };

    const handleEntry = async (record: any) => {
        setCurrentOrder(record);
        setIsEntryMode(true);
        setIsDetailModalOpen(true);
        fetchOrderItems(record.id);
    };

    const handleActualStockChange = async (itemId: number, value: number | null) => {
        setOrderItems(prev => prev.map(item => {
            if (item.id === itemId) {
                const actualStock = value;
                const diffQuantity = actualStock != null ? actualStock - item.systemStock : null;
                return { ...item, actualStock, diffQuantity };
            }
            return item;
        }));
    };

    const handleSaveActualStock = async (itemId: number) => {
        const item = orderItems.find(i => i.id === itemId);
        if (!item) return;
        try {
            await api.put(`/stocktake/items/${itemId}`, {
                actualStock: item.actualStock
            });
            message.success('保存成功');
            fetchOrderItems(currentOrder.id);
        } catch (e) {
            fetchOrderItems(currentOrder.id);
        }
    };

    const handleConfirm = (record: any) => {
        Modal.confirm({
            title: '确认盘点',
            content: '确认后将根据实盘数量调整库存，确认后不可撤销。',
            okText: '确认',
            cancelText: '取消',
            okType: 'primary',
            onOk: async () => {
                await api.post(`/stocktake/${record.id}/confirm`);
                message.success('确认成功');
                fetchData();
                setIsDetailModalOpen(false);
            },
        });
    };

    const handleDelete = (record: any) => {
        Modal.confirm({
            title: '确认删除',
            content: '确定要删除该盘点单吗？',
            okText: '确认',
            cancelText: '取消',
            okType: 'danger',
            onOk: async () => {
                await api.delete(`/stocktake/${record.id}`);
                message.success('删除成功');
                fetchData();
            },
        });
    };

    const getStatusTag = (status: string) => {
        if (status === 'DRAFT') {
            return <Tag color="gold">草稿</Tag>;
        } else if (status === 'CONFIRMED') {
            return <Tag color="green">已确认</Tag>;
        }
        return <Tag>{status}</Tag>;
    };

    const columns = [
        { title: '盘点单号', dataIndex: 'orderNo', key: 'orderNo' },
        {
            title: '分类',
            dataIndex: 'categoryId',
            key: 'categoryId',
            render: (id: number) => categories.find(c => c.id === id)?.name || '全部分类'
        },
        { title: '状态', dataIndex: 'status', key: 'status', render: getStatusTag },
        { title: '创建人', dataIndex: 'creatorName', key: 'creatorName' },
        { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', render: (val: string) => val?.replace('T', ' ') },
        { title: '确认人', dataIndex: 'confirmerName', key: 'confirmerName' },
        { title: '确认时间', dataIndex: 'confirmedAt', key: 'confirmedAt', render: (val: string) => val?.replace('T', ' ') },
        {
            title: '操作',
            key: 'action',
            width: 280,
            render: (_: any, record: any) => (
                <Space size="small">
                    <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)}>查看</Button>
                    {record.status === 'DRAFT' && (
                        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEntry(record)}>录入实盘</Button>
                    )}
                    {record.status === 'DRAFT' && isAdmin && (
                        <Button type="link" size="small" icon={<CheckOutlined />} onClick={() => handleConfirm(record)}>确认</Button>
                    )}
                    {record.status === 'DRAFT' && (
                        <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>删除</Button>
                    )}
                </Space>
            ),
        },
    ];

    const itemColumns = [
        { title: '货物编号', dataIndex: 'goodsCode', key: 'goodsCode' },
        { title: '货物名称', dataIndex: 'goodsName', key: 'goodsName' },
        { title: '系统库存', dataIndex: 'systemStock', key: 'systemStock' },
        {
            title: '实盘数量',
            dataIndex: 'actualStock',
            key: 'actualStock',
            render: (_: any, record: any) => {
                if (isEntryMode && currentOrder?.status === 'DRAFT') {
                    return (
                        <InputNumber
                            min={0}
                            value={record.actualStock}
                            onChange={(value) => handleActualStockChange(record.id, value)}
                            onBlur={() => handleSaveActualStock(record.id)}
                            style={{ width: 120 }}
                        />
                    );
                }
                return record.actualStock ?? '-';
            }
        },
        {
            title: '差异数量',
            dataIndex: 'diffQuantity',
            key: 'diffQuantity',
            render: (val: number) => {
                if (val == null) return '-';
                if (val > 0) return <span className="text-green-600">+{val} (盘盈)</span>;
                if (val < 0) return <span className="text-red-600">{val} (盘亏)</span>;
                return <span className="text-gray-500">0</span>;
            }
        },
    ];

    return (
        <div className="space-y-4">
            <Card bordered={false} className="shadow-sm mb-4">
                <Row gutter={16} align="middle">
                    <Col span={24} className="flex justify-end gap-2">
                        <Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button>
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>创建盘点单</Button>
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

            {/* Create Modal */}
            <Modal
                title="创建盘点单"
                open={isCreateModalOpen}
                onOk={handleCreateOk}
                onCancel={() => setIsCreateModalOpen(false)}
                destroyOnClose
                width={500}
            >
                <Form form={createForm} layout="vertical" className="mt-4">
                    <Form.Item name="categoryId" label="盘点分类">
                        <Select
                            placeholder="选择分类（不选则盘点全部）"
                            allowClear
                            options={categories.map(c => ({ label: c.name, value: c.id }))}
                        />
                    </Form.Item>
                    <Form.Item name="remark" label="备注">
                        <Input.TextArea rows={3} />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Detail Modal */}
            <Modal
                title={`${isEntryMode ? '录入实盘' : '盘点详情'} - ${currentOrder?.orderNo}`}
                open={isDetailModalOpen}
                onCancel={() => setIsDetailModalOpen(false)}
                width={900}
                footer={isEntryMode && currentOrder?.status === 'DRAFT' && isAdmin ? [
                    <Button key="confirm" type="primary" icon={<CheckOutlined />} onClick={() => handleConfirm(currentOrder)}>
                        确认盘点
                    </Button>
                ] : null}
            >
                {currentOrder && (
                    <>
                        <Descriptions column={2} className="mb-4">
                            <Descriptions.Item label="盘点单号">{currentOrder.orderNo}</Descriptions.Item>
                            <Descriptions.Item label="状态">{getStatusTag(currentOrder.status)}</Descriptions.Item>
                            <Descriptions.Item label="分类">
                                {categories.find(c => c.id === currentOrder.categoryId)?.name || '全部分类'}
                            </Descriptions.Item>
                            <Descriptions.Item label="创建人">{currentOrder.creatorName}</Descriptions.Item>
                            <Descriptions.Item label="创建时间">{currentOrder.createdAt?.replace('T', ' ')}</Descriptions.Item>
                            {currentOrder.confirmerName && (
                                <Descriptions.Item label="确认人">{currentOrder.confirmerName}</Descriptions.Item>
                            )}
                            {currentOrder.confirmedAt && (
                                <Descriptions.Item label="确认时间">{currentOrder.confirmedAt?.replace('T', ' ')}</Descriptions.Item>
                            )}
                            {currentOrder.remark && (
                                <Descriptions.Item label="备注" span={2}>{currentOrder.remark}</Descriptions.Item>
                            )}
                        </Descriptions>

                        <Divider orientation="left">盘点明细</Divider>

                        <Table
                            columns={itemColumns}
                            dataSource={orderItems}
                            rowKey="id"
                            loading={itemsLoading}
                            pagination={false}
                            size="small"
                        />
                    </>
                )}
            </Modal>
        </div>
    );
};

export default StocktakePage;
