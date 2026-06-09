import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Select, message, Row, Col, Card } from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    ReloadOutlined,
    DownloadOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined
} from '@ant-design/icons';
import api from '../api/request';

const GoodsPage: React.FC = () => {
    const [data, setData] = useState([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [form] = Form.useForm();
    const [recordForm] = Form.useForm();
    const [editingId, setEditingId] = useState<number | null>(null);
    const [currentGoods, setCurrentGoods] = useState<any>(null);
    const [searchParams, setSearchParams] = useState({ name: '', categoryId: undefined });

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/goods', { params: searchParams }) as any;
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
    }, [searchParams]);

    const handleAdd = () => {
        setEditingId(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (record: any) => {
        setEditingId(record.id);
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        Modal.confirm({
            title: '确认删除',
            content: '如果删除该货物，相关的库存记录也将被清除。',
            okText: '确认',
            cancelText: '取消',
            okType: 'danger',
            onOk: async () => {
                await api.delete(`/goods/${id}`) as any;
                message.success('删除成功');
                fetchData();
            },
        });
    };

    const handleBatchDelete = () => {
        Modal.confirm({
            title: '确认批量删除',
            content: `确定要删除选中的 ${selectedRowKeys.length} 个货物吗？`,
            okText: '确认',
            cancelText: '取消',
            okType: 'danger',
            onOk: async () => {
                await api.post('/goods/batch-delete', selectedRowKeys) as any;
                message.success('批量删除成功');
                setSelectedRowKeys([]);
                fetchData();
            },
        });
    };

    const handleOk = async () => {
        const values = await form.validateFields();
        if (editingId) {
            await api.put('/goods', { ...values, id: editingId }) as any;
            message.success('修改成功');
        } else {
            await api.post('/goods', values) as any;
            message.success('添加成功');
        }
        setIsModalOpen(false);
        fetchData();
    };

    const handleInventory = (record: any, type: 'IN' | 'OUT') => {
        setCurrentGoods(record);
        recordForm.resetFields();
        recordForm.setFieldsValue({ type, quantity: 1 });
        setIsRecordModalOpen(true);
    };

    const handleRecordOk = async () => {
        const values = await recordForm.validateFields();
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        await api.post('/records', {
            ...values,
            goodsId: currentGoods.id,
            operatorId: user.id || 0,
            operatorName: user.nickname || user.username || 'unknown'
        }) as any;
        message.success('操作成功');
        setIsRecordModalOpen(false);
        fetchData();
    };

    const handleExport = () => {
        window.location.href = '/api/goods/export';
    };

    const columns = [
        { title: '编号', dataIndex: 'code', key: 'code' },
        { title: '名称', dataIndex: 'name', key: 'name' },
        {
            title: '分类',
            dataIndex: 'categoryId',
            key: 'categoryId',
            render: (id: number) => categories.find(c => c.id === id)?.name || '未分类'
        },
        {
            title: '库存',
            dataIndex: 'stock',
            key: 'stock',
            render: (stock: number) => (
                <span className={stock < 10 ? 'text-red-500 font-bold' : ''}>{stock}</span>
            )
        },
        { title: '单位', dataIndex: 'unit', key: 'unit' },
        { title: '单价', dataIndex: 'price', key: 'price', render: (val: number) => `¥${val.toFixed(2)}` },
        {
            title: '操作',
            key: 'action',
            width: 300,
            render: (_: any, record: any) => (
                <Space size="small">
                    <Button type="link" size="small" icon={<ArrowUpOutlined />} onClick={() => handleInventory(record, 'IN')}>入库</Button>
                    <Button type="link" size="small" icon={<ArrowDownOutlined />} onClick={() => handleInventory(record, 'OUT')}>出库</Button>
                    <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
                    <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>删除</Button>
                </Space>
            ),
        },
    ];

    return (
        <div className="space-y-4">
            <Card bordered={false} className="shadow-sm mb-4">
                <Row gutter={16} align="middle">
                    <Col span={6}>
                        <Input
                            placeholder="搜索货物名称"
                            prefix={<SearchOutlined />}
                            onChange={e => setSearchParams({ ...searchParams, name: e.target.value })}
                        />
                    </Col>
                    <Col span={6}>
                        <Select
                            placeholder="按分类筛选"
                            className="w-full"
                            allowClear
                            onChange={val => setSearchParams({ ...searchParams, categoryId: val })}
                            options={categories.map(c => ({ label: c.name, value: c.id }))}
                        />
                    </Col>
                    <Col span={12} className="flex justify-end gap-2">
                        <Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button>
                        <Button icon={<DownloadOutlined />} onClick={handleExport}>导出数据</Button>
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增货物</Button>
                    </Col>
                </Row>
            </Card>

            <div className="mb-2">
                <Button
                    danger
                    disabled={selectedRowKeys.length === 0}
                    icon={<DeleteOutlined />}
                    onClick={handleBatchDelete}
                >
                    批量删除 ({selectedRowKeys.length})
                </Button>
            </div>

            <Table
                rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
                columns={columns}
                dataSource={data}
                rowKey="id"
                loading={loading}
                className="shadow-sm"
            />

            {/* Add/Edit Modal */}
            <Modal
                title={editingId ? "编辑货物" : "新增货物"}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={() => setIsModalOpen(false)}
                destroyOnClose
                width={600}
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="name" label="货物名称" rules={[{ required: true, message: '请输入名称' }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="code" label="编号" rules={[{ required: true, message: '请输入编号' }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="categoryId" label="分类" rules={[{ required: true, message: '请选择分类' }]}>
                                <Select options={categories.map(c => ({ label: c.name, value: c.id }))} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="unit" label="单位" rules={[{ required: true, message: '请输入单位' }]}>
                                <Input placeholder="如: 台, 件, 支" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="price" label="单价" rules={[{ required: true, message: '请输入单价' }]}>
                                <InputNumber className="w-full" prefix="¥" precision={2} />
                            </Form.Item>
                        </Col>
                        {!editingId && (
                            <Col span={12}>
                                <Form.Item name="stock" label="初始库存" initialValue={0}>
                                    <InputNumber className="w-full" min={0} />
                                </Form.Item>
                            </Col>
                        )}
                    </Row>
                    <Form.Item name="remark" label="备注">
                        <Input.TextArea rows={3} />
                    </Form.Item>
                </Form>
            </Modal>

            {/* In/Out Modal */}
            <Modal
                title={`${currentGoods?.name} - ${recordForm.getFieldValue('type') === 'IN' ? '入库' : '出库'}`}
                open={isRecordModalOpen}
                onOk={handleRecordOk}
                onCancel={() => setIsRecordModalOpen(false)}
            >
                <Form form={recordForm} layout="vertical" className="mt-4">
                    <Form.Item name="type" hidden><Input /></Form.Item>
                    <Form.Item name="quantity" label="数量" rules={[{ required: true, message: '请输入数量' }]}>
                        <InputNumber className="w-full" min={1} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default GoodsPage;
