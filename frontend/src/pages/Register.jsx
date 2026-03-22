import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Register() {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      await api.post('/auth/register', {
        username: values.username,
        email: values.email,
        password: values.password,
      });
      message.success('Регистрация успешна! Теперь войдите.');
      navigate('/login');
    } catch {
      message.error('Ошибка регистрации. Возможно, пользователь уже существует.');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        padding: '20px',
      }}
    >
      <Card
        style={{
          width: 400,
          borderRadius: 24,
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          border: '1px solid #eaeef2',
        }}
        title="Создать аккаунт"
      >
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Введите имя пользователя' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Имя пользователя" size="large" />
          </Form.Item>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Введите email' },
              { type: 'email', message: 'Некорректный email' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Введите пароль' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Пароль" size="large" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              style={{
                width: '100%',
                height: 48,
                borderRadius: 12,
                background: '#2563eb',
              }}
            >
              Зарегистрироваться
            </Button>
          </Form.Item>
        </Form>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </div>
      </Card>
    </div>
  );
}