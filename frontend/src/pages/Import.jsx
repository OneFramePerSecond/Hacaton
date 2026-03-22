import { Card, Form, Input, Button, message, Alert } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { useState } from 'react';
import api from '../api';

export default function Import() {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await api.post('/api/import', {
        email: values.email,
        password: values.password,
      });
      message.success(`Импортировано: ${res.data.imported.length}`);
    } catch {
      message.error('Ошибка импорта');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Импорт из почты">
      <Alert message="Демо-режим" description="Будут добавлены тестовые подписки" type="info" showIcon style={{ marginBottom: 20 }} />
      <Form onFinish={onFinish} layout="vertical">
        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
          <Input prefix={<MailOutlined />} />
        </Form.Item>
        <Form.Item name="password" label="Пароль" rules={[{ required: true }]}>
          <Input.Password prefix={<LockOutlined />} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>Импортировать</Button>
        </Form.Item>
      </Form>
    </Card>
  );
}