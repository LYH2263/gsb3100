import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Spin } from 'antd';
import {
    DatabaseOutlined,
    TagsOutlined,
    InboxOutlined,
    HistoryOutlined
} from '@ant-design/icons';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import api from '../api/request';

const Dashboard: React.FC = () => {
    const [summary, setSummary] = useState<any>(null);
    const [distribution, setDistribution] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [sum, dist] = await Promise.all([
                    api.get('/statistics/summary'),
                    api.get('/statistics/category-distribution')
                ]) as any;
                setSummary(sum);
                setDistribution(dist);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    if (loading) return <div className="flex justify-center items-center h-full"><Spin size="large" /></div>;

    return (
        <div className="space-y-6">
            <Row gutter={16}>
                <Col span={6}>
                    <Card bordered={false} className="shadow-sm">
                        <Statistic
                            title="货物总数"
                            value={summary?.totalGoods}
                            prefix={<DatabaseOutlined className="text-blue-500 mr-2" />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} className="shadow-sm">
                        <Statistic
                            title="分类数量"
                            value={summary?.totalCategories}
                            prefix={<TagsOutlined className="text-green-500 mr-2" />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} className="shadow-sm">
                        <Statistic
                            title="当前库存总量"
                            value={summary?.totalStock}
                            prefix={<InboxOutlined className="text-orange-500 mr-2" />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} className="shadow-sm">
                        <Statistic
                            title="出入库记录"
                            value={summary?.totalRecords}
                            prefix={<HistoryOutlined className="text-purple-500 mr-2" />}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Card title="货物分类分布" bordered={false} className="shadow-sm h-[400px]">
                        <div style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={distribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {distribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="货物库存对比" bordered={false} className="shadow-sm h-[400px]">
                        <div style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={distribution}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#1677ff" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;
