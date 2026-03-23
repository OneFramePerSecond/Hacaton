import { Card, Form, Input, Button, message, Alert } from 'antd';
import { MailOutlined, FileTextOutlined } from '@ant-design/icons';
import { useState } from 'react';
import api from '../api';

export default function Import() {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    if (!values.email_text.trim()) {
      message.error('Введите текст письма');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/api/import', {
        email_text: values.email_text,
      });
      if (res.data.imported && res.data.imported.length) {
        message.success(`Успешно импортировано: ${res.data.imported.join(', ')}`);
      } else {
        message.info('Подписка не найдена или уже существует');
      }
    } catch (error) {
      const detail = error.response?.data?.detail;
      message.error(detail || 'Ошибка импорта');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Импорт из почты" style={{ maxWidth: 600, margin: '0 auto' }}>
      <Alert
        message="Как это работает"
        description="Вставьте текст письма с подтверждением подписки. Система автоматически извлечёт название, цену, период и дату следующего списания."
        type="info"
        showIcon
        style={{ marginBottom: 20 }}
      />
      <Form onFinish={onFinish} layout="vertical">
        <Form.Item
          name="email_text"
          label="Текст письма"
          rules={[{ required: true, message: 'Вставьте текст письма' }]}
        >
          <Input.TextArea
            rows={8}
            placeholder="Пример: Netflix: списано 999 ₽. Следующий платёж 15.04.2026."
            prefix={<FileTextOutlined />}
          />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<MailOutlined />}
            size="large"
            block
          >
            Импортировать
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}