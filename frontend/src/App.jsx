import { Layout, Menu, Spin, message } from 'antd';
import { Link, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  BarChartOutlined,
  MailOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import api from './api';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Import from './pages/Import';
import Login from './pages/Login';
import Register from './pages/Register';

const { Header, Content, Footer } = Layout;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    let ignore = false;

    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        if (!ignore) setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (!ignore) setUser(res.data);
      } catch {
        localStorage.removeItem('token');
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadUser();

    return () => {
      ignore = true;
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    message.success('Выход выполнен');
  };

  if (loading) {
    return <Spin size="large" style={{ display: 'block', marginTop: 100 }} />;
  }

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {!isAuthPage && user && (
        <Header>
          <div style={{ float: 'left', color: 'white', marginRight: 30, fontSize: 18 }}>
            SubControl
          </div>
          <Menu theme="dark" mode="horizontal" selectedKeys={[location.pathname]}>
            <Menu.Item key="/" icon={<HomeOutlined />}>
              <Link to="/">Подписки</Link>
            </Menu.Item>
            <Menu.Item key="/analytics" icon={<BarChartOutlined />}>
              <Link to="/analytics">Аналитика</Link>
            </Menu.Item>
            <Menu.Item key="/import" icon={<MailOutlined />}>
              <Link to="/import">Импорт</Link>
            </Menu.Item>
            <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout} style={{ marginLeft: 'auto' }}>
              Выход
            </Menu.Item>
          </Menu>
        </Header>
      )}
      <Content style={{ padding: isAuthPage ? 0 : '0 50px', marginTop: isAuthPage ? 0 : 50 }}>
        <div
          style={{
            background: isAuthPage ? 'transparent' : '#fff',
            minHeight: isAuthPage ? 'auto' : 380,
            padding: isAuthPage ? 0 : 24,
          }}
        >
          <Routes>
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/analytics" element={user ? <Analytics /> : <Navigate to="/login" />} />
            <Route path="/import" element={user ? <Import /> : <Navigate to="/login" />} />
          </Routes>
        </div>
      </Content>
      <Footer
        style={{
          textAlign: 'center',
          background: '#f0f2f5',
          borderTop: '1px solid #e8e8e8',
          padding: '24px 50px',
        }}
      >
        <div style={{ fontWeight: 500, fontSize: 16 }}>
          SubControl © {new Date().getFullYear()}
        </div>
        <div style={{ marginTop: 8, fontSize: 14, color: '#6b7280' }}>
          Связь:{' '}
          <a
            href="https://t.me/Goditer"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#2563eb', textDecoration: 'none' }}
          >
            @Goditer
          </a>
        </div>
      </Footer>
    </Layout>
  );
}

export default App;