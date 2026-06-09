import React, { useEffect, useState } from 'react';
import {
    Table, Button, Space, Modal, Form, Select, Input, InputNumber,
    Tag, message, Card, Row, Col, Descriptions, Popconfirm
} from 'antd';
import {
    PlusOutlined, ReloadOutlined, EditOutlined, CheckCircleOutlined, EyeOutlined
} from '@ant-design/icons';
import api from '../api/request';

interface StocktakeItem {
    id: number;
    orderId: number;
    goodsId: number;
    goodsName: string;
    goodsCode: string;
    systemQty: number;
    actualQty: number | null;
    diff: number | null;
}

interface StocktakeOrder {
    id: number;
    code: string;
    categoryId: number | null;
    status: 'DRAFT' | 'CONFIRMED';
    remark?: string;
    creatorName?: string;
    confirmerName?: string;
    confirmedAt?: string;
    createdAt?: string;
    items?: StocktakeItem[];
}

const Stocktake: React.FC = () => {
    const [list, setList] = useState<StocktakeOrder[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [current, setCurrent] = useState<StocktakeOrder | null>(null);
    const [createForm] = Form.useForm();

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = user.role === 'ADMIN';

    const fetchList = async () => {
        setLoading(true);
        try {
            const res = await api.get('/stocktakes') as any;
            setList(res || []);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        const res = await api.get('/categories') as any;
        setCategories(res || []);
    };

    useEffect(() => {
        fetchList();
        fetchCategories();
    }, []);

    const handleCreate = async () => {
        const values = await createForm.validateFields();
        await api.post('/stocktakes', values) as any;
        message.success('创建成功');
        setCreateOpen(false);
        createForm.resetFields();
        fetchList();
    };

    const openDetail = async (id: number) => {
        const res = await api.get(`/stocktakes/${id}`) as any;
        setCurrent(res);
        setDetailOpen(true);
    };

    const reloadDetail = async () => {
        if (!current) return;
        const res = await api.get(`/stocktakes/${current.id}`) as any;
        setCurrent(res);
        fetchList();
    };

    const handleSaveActual = async (item: StocktakeItem, val: number | null) => {
        if (val === null || val === undefined) return;
        try {
            await api.put(`/stocktakes/items/${item.id}`, { actualQty: val }) as any;
            message.success('已保存');
            reloadDetail();
        } catch {/* error toast handled by request */}
    };

    const handleConfirm = async () => {
        if (!current) return;
        try {
            await api.post(`/stocktakes/${current.id}/confirm`) as any;
            message.success('已确认');
            reloadDetail();
        } catch {/* error toast handled by request */}
    };

    const columns = [
        { title: '单号', dataIndex: 'code', key: 'code' },
        {
            title: '盘点范围',
            dataIndex: 'categoryId',
            key: 'categoryId',
            render: (id: number | null) =>
                id ? (categories.find(c => c.id === id)?.name || '-') : '全部'
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (s: string) => s === 'DRAFT'
                ? <Tag color="orange">草稿</Tag>
                : <Tag color="green">已确认</Tag>
        },
        { title: '创建人', dataIndex: 'creatorName', key: 'creatorName' },
        { title: '确认人', dataIndex: 'confirmerName', key: 'confirmerName', render: (v: any) => v || '-' },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (v: string) => v?.replace('T', ' ')
        },
        {
            title: '操作',
            key: 'action',
            render: (_: any, row: StocktakeOrder) => (
                <Space>
                    <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => openDetail(row.id)}>
                        查看
                    </Button>
                    {row.status === 'DRAFT' && (
                        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openDetail(row.id)}>
                            录入实盘
                        </Button>
                    )}
                </Space>
            )
        }
    ];

    const itemColumns = [
        { title: '编号', dataIndex: 'goodsCode', key: 'goodsCode' },
        { title: '名称', dataIndex: 'goodsName', key: 'goodsName' },
        { title: '基准库存', dataIndex: 'systemQty', key: 'systemQty' },
        {
            title: '实盘数量',
            dataIndex: 'actualQty',
            key: 'actualQty',
            render: (val: number | null, row: StocktakeItem) => {
                if (current?.status === 'CONFIRMED') return val ?? '-';
                return (
                    <InputNumber
                        min={0}
                        defaultValue={val ?? undefined}
                        placeholder="未录入"
                        onBlur={(e) => {
                            const n = e.target.value === '' ? null : Number(e.target.value);
                            if (n !== null && !Number.isNaN(n) && n !== val) {
                                handleSaveActual(row, n);
                            }
                        }}
                    />
                );
            }
        },
        {
            title: '差异',
            dataIndex: 'diff',
            key: 'diff',
            render: (v: number | null) => {
                if (v === null || v === undefined) return '-';
                if (v > 0) return <Tag color="green">盘盈 +{v}</Tag>;
                if (v < 0) return <Tag color="red">盘亏 {v}</Tag>;
                return <Tag>一致</Tag>;
            }
        }
    ];

    return (
        <div className="space-y-4">
            <Card bordered={false} className="shadow-sm">
                <Row justify="space-between" align="middle">
                    <Col>
                        <h2 className="text-xl font-bold m-0">库存盘点</h2>
                    </Col>
                    <Col>
                        <Space>
                            <Button icon={<ReloadOutlined />} onClick={fetchList}>刷新</Button>
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
                                创建盘点单
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            <Table
                columns={columns}
                dataSource={list}
                rowKey="id"
                loading={loading}
                className="shadow-sm"
            />

            <Modal
                title="创建盘点单"
                open={createOpen}
                onOk={handleCreate}
                onCancel={() => setCreateOpen(false)}
                destroyOnClose
            >
                <Form form={createForm} layout="vertical" className="mt-4">
                    <Form.Item name="categoryId" label="盘点分类（不选则全部）">
                        <Select
                            allowClear
                            placeholder="选择分类"
                            options={categories.map(c => ({ label: c.name, value: c.id }))}
                        />
                    </Form.Item>
                    <Form.Item name="remark" label="备注">
                        <Input.TextArea rows={3} />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title={`盘点单 ${current?.code || ''}`}
                open={detailOpen}
                onCancel={() => setDetailOpen(false)}
                width={900}
                footer={
                    current?.status === 'DRAFT' ? (
                        <Space>
                            <Button onClick={() => setDetailOpen(false)}>关闭</Button>
                            {isAdmin ? (
                                <Popconfirm
                                    title="确认盘点？"
                                    description="确认后将按差异生成 ADJUST 流水并调整库存，无法撤销。"
                                    onConfirm={handleConfirm}
                                >
                                    <Button type="primary" icon={<CheckCircleOutlined />}>确认盘点</Button>
                                </Popconfirm>
                            ) : (
                                <Button type="primary" icon={<CheckCircleOutlined />} disabled>
                                    确认盘点（仅管理员）
                                </Button>
                            )}
                        </Space>
                    ) : (
                        <Button onClick={() => setDetailOpen(false)}>关闭</Button>
                    )
                }
            >
                {current && (
                    <>
                        <Descriptions size="small" column={2} bordered className="mb-4">
                            <Descriptions.Item label="状态">
                                {current.status === 'DRAFT'
                                    ? <Tag color="orange">草稿</Tag>
                                    : <Tag color="green">已确认（归档）</Tag>}
                            </Descriptions.Item>
                            <Descriptions.Item label="范围">
                                {current.categoryId
                                    ? (categories.find(c => c.id === current.categoryId)?.name || '-')
                                    : '全部'}
                            </Descriptions.Item>
                            <Descriptions.Item label="创建人">{current.creatorName}</Descriptions.Item>
                            <Descriptions.Item label="确认人">{current.confirmerName || '-'}</Descriptions.Item>
                            <Descriptions.Item label="创建时间" span={2}>
                                {current.createdAt?.replace('T', ' ')}
                            </Descriptions.Item>
                            <Descriptions.Item label="备注" span={2}>{current.remark || '-'}</Descriptions.Item>
                        </Descriptions>
                        <Table
                            size="small"
                            columns={itemColumns}
                            dataSource={current.items || []}
                            rowKey="id"
                            pagination={false}
                        />
                    </>
                )}
            </Modal>
        </div>
    );
};

export default Stocktake;
