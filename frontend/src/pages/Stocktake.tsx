import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, Tag, message, Row, Col, Card, InputNumber, Descriptions, Badge } from 'antd';
import { PlusOutlined, EyeOutlined, CheckOutlined, EditOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import api from '../api/request';

const { TextArea } = Input;

const StocktakePage: React.FC = () => {
    const [data, setData] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
    const [currentOrder, setCurrentOrder] = useState<any>(null);
    const [detailData, setDetailData] = useState<any>(null);
    const [entryData, setEntryData] = useState<any>(null);
    const [searchStatus, setSearchStatus] = useState<string | undefined>(undefined);
    const [form] = Form.useForm();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = user.role === 'ADMIN';

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/stocktake', { params: { status: searchStatus } }) as any;
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
    }, [searchStatus]);

    const handleCreate = () => {
        form.resetFields();
        setIsCreateModalOpen(true);
    };

    const handleCreateOk = async () => {
        const values = await form.validateFields();
        await api.post('/stocktake', values) as any;
        message.success('创建成功');
        setIsCreateModalOpen(false);
        fetchData();
    };

    const handleView = async (record: any) => {
        const res = await api.get(`/stocktake/${record.id}`) as any;
        setDetailData(res);
        setIsDetailModalOpen(true);
    };

    const handleEntry = async (record: any) => {
        const res = await api.get(`/stocktake/${record.id}`) as any;
        setEntryData(res);
        setCurrentOrder(record);
        setIsEntryModalOpen(true);
    };

    const handleActualStockChange = async (itemId: number, value: number | null) => {
        if (value === null || value < 0) return;
        await api.put(`/stocktake/item/${itemId}`, { actualStock: value }) as any;
        const res = await api.get(`/stocktake/${currentOrder.id}`) as any;
        setEntryData(res);
    };

    const handleConfirm = (record: any) => {
        Modal.confirm({
            title: '确认盘点',
            content: '确认后将根据实盘数量调整库存，此操作不可撤销！',
            okText: '确认',
            cancelText: '取消',
            okType: 'danger',
            onOk: async () => {
                await api.post(`/stocktake/${record.id}/confirm`) as any;
                message.success('盘点确认成功，库存已调整');
                fetchData();
            },
        });
    };

    const getStatusTag = (status: string) => {
        if (status === 'DRAFT') return <Tag color="blue">草稿</Tag>;
        if (status === 'CONFIRMED') return <Tag color="green">已确认</Tag>;
        return <Tag>{status}</Tag>;
    };

    const getDiffTag = (diff: number | null) => {
        if (diff === null || diff === undefined) return <Tag>待录入</Tag>;
        if (diff > 0) return <Tag color="green">盘盈 +{diff}</Tag>;
        if (diff < 0) return <Tag color="red">盘亏 {diff}</Tag>;
        return <Tag color="default">一致</Tag>;
    };

    const columns = [
        { title: '盘点单号', dataIndex: 'orderNo', key: 'orderNo' },
        { title: '状态', dataIndex: 'status', key: 'status', render: (s: string) => getStatusTag(s) },
        { title: '分类', dataIndex: 'categoryName', key: 'categoryName', render: (v: string) => v || '全部' },
        { title: '创建人', dataIndex: 'creatorName', key: 'creatorName' },
        { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', render: (v: string) => v?.replace('T', ' ').substring(0, 19) },
        { title: '确认人', dataIndex: 'confirmerName', key: 'confirmerName', render: (v: string) => v || '-' },
        { title: '确认时间', dataIndex: 'confirmedAt', key: 'confirmedAt', render: (v: string) => v ? v.replace('T', ' ').substring(0, 19) : '-' },
        {
            title: '操作',
            key: 'action',
            width: 250,
            render: (_: any, record: any) => (
                <Space size="small">
                    <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)}>查看</Button>
                    {record.status === 'DRAFT' && (
                        <>
                            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEntry(record)}>录入实盘</Button>
                            {isAdmin && (
                                <Button type="link" size="small" danger icon={<CheckOutlined />} onClick={() => handleConfirm(record)}>确认</Button>
                            )}
                        </>
                    )}
                </Space>
            ),
        },
    ];

    const itemColumns = [
        { title: '货物编码', dataIndex: 'goodsCode', key: 'goodsCode' },
        { title: '货物名称', dataIndex: 'goodsName', key: 'goodsName' },
        { title: '单位', dataIndex: 'unit', key: 'unit' },
        { title: '系统库存', dataIndex: 'systemStock', key: 'systemStock' },
        { title: '实盘数量', dataIndex: 'actualStock', key: 'actualStock', render: (v: number) => v ?? '-' },
        { title: '差异', dataIndex: 'difference', key: 'difference', render: (v: number) => getDiffTag(v) },
    ];

    const entryColumns = [
        { title: '货物编码', dataIndex: 'goodsCode', key: 'goodsCode' },
        { title: '货物名称', dataIndex: 'goodsName', key: 'goodsName' },
        { title: '系统库存', dataIndex: 'systemStock', key: 'systemStock' },
        {
            title: '实盘数量',
            key: 'actualStock',
            render: (_: any, record: any) => (
                <InputNumber
                    min={0}
                    defaultValue={record.actualStock ?? 0}
                    onPressEnter={(e) => handleActualStockChange(record.id, parseInt((e.target as HTMLInputElement).value))}
                    onBlur={(e) => {
                        const val = parseInt((e.target as HTMLInputElement).value);
                        if (!isNaN(val) && val !== record.actualStock) {
                            handleActualStockChange(record.id, val);
                        }
                    }}
                />
            )
        },
        {
            title: '差异',
            key: 'difference',
            render: (_: any, record: any) => {
                const actual = record.actualStock ?? 0;
                const diff = actual - record.systemStock;
                return getDiffTag(diff);
            }
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
                            value={searchStatus}
                            onChange={setSearchStatus}
                            options={[
                                { label: '草稿', value: 'DRAFT' },
                                { label: '已确认', value: 'CONFIRMED' },
                            ]}
                        />
                    </Col>
                    <Col span={18} className="flex justify-end gap-2">
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

            <Modal
                title="创建盘点单"
                open={isCreateModalOpen}
                onOk={handleCreateOk}
                onCancel={() => setIsCreateModalOpen(false)}
                destroyOnClose
                width={500}
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Form.Item name="categoryId" label="盘点分类">
                        <Select
                            allowClear
                            placeholder="不选则盘点所有货物"
                            options={categories.map((c: any) => ({ label: c.name, value: c.id }))}
                        />
                    </Form.Item>
                    <Form.Item name="remark" label="备注">
                        <TextArea rows={3} placeholder="可选" />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="盘点单详情"
                open={isDetailModalOpen}
                onCancel={() => setIsDetailModalOpen(false)}
                footer={null}
                width={900}
            >
                {detailData && (
                    <>
                        <Descriptions bordered column={2} className="mb-4">
                            <Descriptions.Item label="盘点单号">{detailData.orderNo}</Descriptions.Item>
                            <Descriptions.Item label="状态">{getStatusTag(detailData.status)}</Descriptions.Item>
                            <Descriptions.Item label="盘点分类">{detailData.categoryName || '全部'}</Descriptions.Item>
                            <Descriptions.Item label="备注">{detailData.remark || '-'}</Descriptions.Item>
                            <Descriptions.Item label="创建人">{detailData.creatorName}</Descriptions.Item>
                            <Descriptions.Item label="创建时间">{detailData.createdAt?.replace('T', ' ').substring(0, 19)}</Descriptions.Item>
                            {detailData.status === 'CONFIRMED' && (
                                <>
                                    <Descriptions.Item label="确认人">{detailData.confirmerName}</Descriptions.Item>
                                    <Descriptions.Item label="确认时间">{detailData.confirmedAt?.replace('T', ' ').substring(0, 19)}</Descriptions.Item>
                                </>
                            )}
                        </Descriptions>
                        <Table
                            columns={itemColumns}
                            dataSource={detailData.items}
                            rowKey="id"
                            pagination={false}
                            size="small"
                        />
                    </>
                )}
            </Modal>

            <Modal
                title="录入实盘数量"
                open={isEntryModalOpen}
                onCancel={() => setIsEntryModalOpen(false)}
                footer={[
                    <Button key="close" onClick={() => setIsEntryModalOpen(false)}>关闭</Button>
                ]}
                width={800}
            >
                {entryData && (
                    <div className="mb-3">
                        <Space>
                            <Badge status="processing" text="单号:" />
                            <span className="font-medium">{entryData.orderNo}</span>
                            <span className="text-gray-500 ml-4">提示：输入数量后按回车或失焦自动保存</span>
                        </Space>
                    </div>
                )}
                <Table
                    columns={entryColumns}
                    dataSource={entryData?.items || []}
                    rowKey="id"
                    pagination={false}
                    size="small"
                />
            </Modal>
        </div>
    );
};

export default StocktakePage;
