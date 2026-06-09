import React, { useEffect, useState } from 'react';
import { Table, Tag } from 'antd';
import api from '../api/request';

const Logs: React.FC = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/logs') as any;
            setData(res);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const columns = [
        { title: '时间', dataIndex: 'createdAt', key: 'createdAt', render: (val: string) => val?.replace('T', ' ') },
        { title: '操作人', dataIndex: 'username', key: 'username' },
        {
            title: '操作内容',
            dataIndex: 'operation',
            key: 'operation',
            render: (op: string) => <Tag color="blue">{op}</Tag>
        },
        { title: '请求接口', dataIndex: 'method', key: 'method', ellipsis: true },
        { title: '参数', dataIndex: 'params', key: 'params', ellipsis: true },
        { title: 'IP地址', dataIndex: 'ip', key: 'ip' },
    ];

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold">操作日志</h2>
            <Table
                columns={columns}
                dataSource={data}
                rowKey="id"
                loading={loading}
                className="shadow-sm rounded-lg"
                pagination={{ pageSize: 15 }}
            />
        </div>
    );
};

export default Logs;
