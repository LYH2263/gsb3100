import React, { useState } from 'react';
import { Card, Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../api/request';

const Login: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const user = await api.post('/auth/login', values) as any;
            localStorage.setItem('user', JSON.stringify(user));
            message.success('登录成功');
            navigate('/dashboard');
        } catch (error) {
            // Error handled by interceptor
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-vh-100 min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600">
            <Card className="w-full max-w-md shadow-2xl rounded-2xl border-none p-4">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">货物管理系统</h2>
                    <p className="text-gray-500 mt-2">请登录您的账号</p>
                </div>
                <Form
                    name="login"
                    size="large"
                    initialValues={{ username: 'admin', password: '' }}
                    onFinish={onFinish}
                >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: '请输入用户名' }]}
                    >
                        <Input prefix={<UserOutlined className="text-gray-400" />} placeholder="用户名" />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: '请输入密码' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined className="text-gray-400" />}
                            placeholder=""
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="w-full h-12 text-lg font-semibold" loading={loading}>
                            登录
                        </Button>
                    </Form.Item>
                </Form>

            </Card>
        </div>
    );
};

export default Login;
