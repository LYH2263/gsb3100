import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, InputNumber, message, Tag, Card, Descriptions, Statistic, Row, Col } from 'antd';
import {
    ArrowLeftOutlined,
    SaveOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/request';

const StocktakeDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [stocktake, setStocktake] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [editedItems, setEditedItems] = useState<Record<number, number | null>>({});
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = user.role === 'ADMIN';
    const isDraft = stocktake?.status === 'DRAFT';

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/stocktakes/${id}`) as any;
            setStocktake(res);
            const edits: Record<number, number | null> = {};
            (res.items || []).forEach((item: any) => {
                edits[item.id] = item.actualStock;
            });
            setEditedItems(edits);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleActualStockChange = (itemId: number, value: number | null) => {
        setEditedItems(prev => ({ ...prev, [itemId]: value }));
    };

    const handleSave = async () => {
        const updates = Object.entries(editedItems).map(([itemId, actualStock]) => ({
            id: Number(itemId),
            actualStock,
        }));
        try {
            await api.put(`/stocktakes/${id}/items`, updates) as any;
            message.success('实盘数量保存成功');
            fetchData();
        } catch (e) {
            // error handled by interceptor
        }
    };

    const handleConfirm = () => {
        const hasUnentered = stocktake.items.some(
            (item: any) => editedItems[item.id] === null || editedItems[item.id] === undefined
        );
        if (hasUnentered) {
            message.warning('请先录入所有货物的实盘数量');
            return;
        }

        Modal.confirm({
            title: '确认盘点',
            content: '确认后将根据实盘与基准差异调整库存，此操作不可撤销。确认继续？',
            okText: '确认盘点',
            cancelText: '取消',
            okType: 'primary',
            onOk: async () => {
                try {
                    await api.put(`/stocktakes/${id}/items`,
                        Object.entries(editedItems).map(([itemId, actualStock]) => ({
                            id: Number(itemId),
                            actualStock,
                        }))
                    ) as any;
                    await api.post(`/stocktakes/${id}/confirm`) as any;
                    message.success('盘点确认成功，库存已调整');
                    fetchData();
                } catch (e) {
                    // error handled by interceptor
                }
            },
        });
    };

    if (!stocktake) return null;

    const items = stocktake.items || [];
    const diffItems = items.filter((item: any) => {
        const actual = editedItems[item.id] ?? item.actualStock;
        return actual !== null && actual !== undefined && actual !== item.systemStock;
    });
    const surplusCount = diffItems.filter((item: any) => {
        const actual = editedItems[item.id] ?? item.actualStock;
        return actual !== null && actual > item.systemStock;
    }).length;
    const deficitCount = diffItems.filter((item: any) => {
        const actual = editedItems[item.id] ?? item.actualStock;
        return actual !== null && actual < item.systemStock;
    }).length;

    const columns: any[] = [
        { title: '编号', dataIndex: 'goodsCode', key: 'goodsCode', width: 120 },
        { title: '货物名称', dataIndex: 'goodsName', key: 'goodsName' },
        { title: '单位', dataIndex: 'unit', key: 'unit', width: 80 },
        {
            title: '系统库存(基准)',
            dataIndex: 'systemStock',
            key: 'systemStock',
            width: 130,
        },
        {
            title: '实盘数量',
            key: 'actualStock',
            width: 150,
            render: (_: any, record: any) => {
                if (!isDraft) {
                    return <span>{record.actualStock}</span>;
                }
                return (
                    <InputNumber
                        min={0}
                        value={editedItems[record.id]}
                        onChange={val => handleActualStockChange(record.id, val)}
                        className="w-full"
                    />
                );
            },
        },
        {
            title: '差异',
            key: 'difference',
            width: 120,
            render: (_: any, record: any) => {
                const actual = editedItems[record.id] ?? record.actualStock;
                if (actual === null || actual === undefined) return '-';
                const diff = actual - record.systemStock;
                if (diff === 0) return <Tag>无差异</Tag>;
                if (diff > 0) return <Tag color="green">+{diff} (盘盈)</Tag>;
                return <Tag color="red">{diff} (盘亏)</Tag>;
            },
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/stocktakes')}>返回列表</Button>
                <Space>
                    {isDraft && (
                        <Button icon={<SaveOutlined />} onClick={handleSave}>保存实盘数量</Button>
                    )}
                    {isDraft && isAdmin && (
                        <Button type="primary" icon={<CheckCircleOutlined />} onClick={handleConfirm}>确认盘点</Button>
                    )}
                </Space>
            </div>

            <Card bordered={false} className="shadow-sm">
                <Descriptions title={stocktake.title} column={3}>
                    <Descriptions.Item label="状态">
                        <Tag color={stocktake.status === 'DRAFT' ? 'orange' : 'green'}>
                            {stocktake.status === 'DRAFT' ? '草稿' : '已确认'}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="分类筛选">{stocktake.categoryName || '全部分类'}</Descriptions.Item>
                    <Descriptions.Item label="创建人">{stocktake.creatorName}</Descriptions.Item>
                    <Descriptions.Item label="创建时间">{stocktake.createdAt?.replace('T', ' ')}</Descriptions.Item>
                    <Descriptions.Item label="确认人">{stocktake.confirmerName || '-'}</Descriptions.Item>
                    <Descriptions.Item label="确认时间">{stocktake.confirmedAt?.replace('T', ' ') || '-'}</Descriptions.Item>
                </Descriptions>
            </Card>

            {items.length > 0 && (
                <Row gutter={16}>
                    <Col span={8}>
                        <Card bordered={false} className="shadow-sm">
                            <Statistic title="盘点货物数" value={items.length} />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card bordered={false} className="shadow-sm">
                            <Statistic
                                title="盘盈"
                                value={surplusCount}
                                valueStyle={{ color: '#52c41a' }}
                                suffix="项"
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card bordered={false} className="shadow-sm">
                            <Statistic
                                title="盘亏"
                                value={deficitCount}
                                valueStyle={{ color: '#ff4d4f' }}
                                suffix="项"
                            />
                        </Card>
                    </Col>
                </Row>
            )}

            <Table
                columns={columns}
                dataSource={items}
                rowKey="id"
                loading={loading}
                className="shadow-sm"
                pagination={false}
            />
        </div>
    );
};

export default StocktakeDetail;
