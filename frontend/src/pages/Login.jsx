import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Login({ setUser }) {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const formData = new FormData();
      formData.append('username', values.username);
      formData.append('password', values.password);
      const res = await api.post('/auth/token', formData);
      localStorage.setItem('token', res.data.access_token);
      const userRes = await api.get('/auth/me');
      setUser(userRes.data);
      message.success('Успешный вход');
      navigate('/');
    } catch {
      message.error('Ошибка входа. Проверьте имя пользователя и пароль.');
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
          width: 400,                // фиксированная ширина
          borderRadius: 24,
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          border: '1px solid #eaeef2',
        }}
        title="Добро пожаловать"
      >
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Введите имя пользователя' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Имя пользователя" size="large" />
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
              Войти
            </Button>
          </Form.Item>
        </Form>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </div>
      </Card>
    </div>
  );
}