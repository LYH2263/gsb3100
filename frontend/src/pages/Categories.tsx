import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../api/request';

const Categories: React.FC = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [editingId, setEditingId] = useState<number | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/categories') as any;
            setData(res);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

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
            content: '您确定要删除这个分类吗？此操作不可恢复。',
            okText: '确认',
            cancelText: '取消',
            okType: 'danger',
            onOk: async () => {
                await api.delete(`/categories/${id}`) as any;
                message.success('删除成功');
                fetchData();
            },
        });
    };

    const handleOk = async () => {
        const values = await form.validateFields();
        if (editingId) {
            await api.put('/categories', { ...values, id: editingId }) as any;
            message.success('修改成功');
        } else {
            await api.post('/categories', values) as any;
            message.success('添加成功');
        }
        setIsModalOpen(false);
        fetchData();
    };

    const columns = [
        { title: '分类名称', dataIndex: 'name', key: 'name' },
        { title: '描述', dataIndex: 'description', key: 'description' },
        { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', render: (val: string) => val?.replace('T', ' ') },
        {
            title: '操作',
            key: 'action',
            render: (_: any, record: any) => (
                <Space size="middle">
                    <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
                    <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>删除</Button>
                </Space>
            ),
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">分类管理</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增分类</Button>
            </div>
            <Table columns={columns} dataSource={data} rowKey="id" loading={loading} className="shadow-sm rounded-lg" />

            <Modal
                title={editingId ? "编辑分类" : "新增分类"}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={() => setIsModalOpen(false)}
                destroyOnClose
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="description" label="描述">
                        <Input.TextArea rows={4} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Categories;
