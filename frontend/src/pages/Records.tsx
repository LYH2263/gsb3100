import React, { useEffect, useState } from 'react';
import { Table, Tag } from 'antd';
import api from '../api/request';

const Records: React.FC = () => {
    const [data, setData] = useState([]);
    const [goods, setGoods] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [recordsRes, goodsRes] = await Promise.all([
                api.get('/records'),
                api.get('/goods')
            ]) as any;
            setData(recordsRes);
            setGoods(goodsRes);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const columns = [
        { title: '时间', dataIndex: 'createdAt', key: 'createdAt', render: (val: string) => val?.replace('T', ' ') },
        {
            title: '货物名称',
            dataIndex: 'goodsId',
            key: 'goodsId',
            render: (id: number) => goods.find(g => g.id === id)?.name || '未知货物'
        },
        {
            title: '类型',
            dataIndex: 'type',
            key: 'type',
            render: (type: string) => {
                const config: Record<string, { color: string; label: string }> = {
                    IN: { color: 'green', label: '入库' },
                    OUT: { color: 'red', label: '出库' },
                    ADJUST: { color: 'blue', label: '盘点调整' },
                };
                const c = config[type] || { color: 'default', label: type };
                return <Tag color={c.color}>{c.label}</Tag>;
            }
        },
        {
            title: '数量',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (val: number, record: any) => {
                if (record.type === 'ADJUST') {
                    if (val > 0) return <span style={{ color: '#52c41a' }}>+{val} (盘盈)</span>;
                    if (val < 0) return <span style={{ color: '#ff4d4f' }}>{val} (盘亏)</span>;
                    return <span>0</span>;
                }
                return val;
            },
        },
        {
            title: '操作人',
            dataIndex: 'operatorName',
            key: 'operatorName',
        },
    ];

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold">出入库记录</h2>
            <Table columns={columns} dataSource={data} rowKey="id" loading={loading} className="shadow-sm" />
        </div>
    );
};

export default Records;
