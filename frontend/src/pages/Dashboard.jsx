import { Button, Row, Col, Card, Spin, Tag, Space, Modal, Form, Input, InputNumber, Select, DatePicker, message, Popconfirm, Alert, List } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, WarningOutlined, BellOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import api from '../api';
import dayjs from 'dayjs';

const { Option } = Select;

export default function Dashboard() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSub, setEditingSub] = useState(null);
  const [form] = Form.useForm();

  // Загрузка подписок
  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/subscriptions');
      setSubscriptions(res.data);
    } catch {
      message.error('Ошибка загрузки подписок');
    } finally {
      setLoading(false);
    }
  };

  // Загрузка уведомлений
  const fetchNotifications = async () => {
    setNotificationsLoading(true);
    try {
      const res = await api.get('/api/notifications');
      setNotifications(res.data);
    } catch {
      message.error('Ошибка загрузки уведомлений');
    } finally {
      setNotificationsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
    fetchNotifications();
  }, []);

  const handleAdd = () => {
    setEditingSub(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingSub(record);
    form.setFieldsValue({
      ...record,
      start_date: dayjs(record.start_date),
      next_billing_date: dayjs(record.next_billing_date),
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/subscriptions/${id}`);
      message.success('Подписка удалена');
      fetchSubscriptions();
      fetchNotifications(); // обновим уведомления после удаления
    } catch {
      message.error('Ошибка удаления');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const formatted = {
        ...values,
        start_date: values.start_date.format('YYYY-MM-DD'),
        next_billing_date: values.next_billing_date.format('YYYY-MM-DD'),
      };
      if (editingSub) {
        await api.put(`/api/subscriptions/${editingSub.id}`, formatted);
        message.success('Подписка обновлена');
      } else {
        await api.post('/api/subscriptions', formatted);
        message.success('Подписка добавлена');
      }
      setModalVisible(false);
      fetchSubscriptions();
      fetchNotifications(); // обновим уведомления после добавления/изменения
    } catch {
      message.error('Проверьте данные');
    }
  };

  // Функция для определения цвета тега в зависимости от количества дней до списания
  const getDaysLeftTag = (nextDate) => {
    const today = dayjs();
    const next = dayjs(nextDate);
    const days = next.diff(today, 'day');
    if (days < 0) return <Tag color="red">Просрочено</Tag>;
    if (days <= 3) return <Tag color="orange" icon={<WarningOutlined />}>Осталось {days} дн.</Tag>;
    if (days <= 7) return <Tag color="blue">Осталось {days} дн.</Tag>;
    return <Tag color="green">Осталось {days} дн.</Tag>;
  };

  const getPeriodLabel = (period) => {
    return period === 'monthly' ? 'ежемесячно' : 'ежегодно';
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 28, fontWeight: 600, margin: 0 }}>Мои подписки</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} size="large">
          Добавить подписку
        </Button>
      </div>

      {/* Блок уведомлений */}
      {notifications.length > 0 ? (
        <Card
          style={{ marginBottom: 24, borderRadius: 16, background: '#fffbe6', border: '1px solid #ffe58f' }}
          bodyStyle={{ padding: 16 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
            <BellOutlined style={{ fontSize: 20, color: '#faad14', marginRight: 8 }} />
            <span style={{ fontWeight: 500, fontSize: 16 }}>Скоро списание</span>
          </div>
          <List
            size="small"
            dataSource={notifications}
            loading={notificationsLoading}
            renderItem={item => (
              <List.Item>
                <List.Item.Meta
                  title={item.name}
                  description={`${item.price} ₽ • ${dayjs(item.next_billing_date).format('DD.MM.YYYY')}`}
                />
                <div>{getDaysLeftTag(item.next_billing_date)}</div>
              </List.Item>
            )}
          />
        </Card>
      ) : (
        !notificationsLoading && (
          <Alert
            message="Нет ближайших списаний"
            description="У вас нет подписок, которые нужно оплатить в ближайшие 3 дня."
            type="info"
            showIcon
            style={{ marginBottom: 24, borderRadius: 8 }}
          />
        )
      )}

      {/* Список подписок в виде карточек */}
      {loading ? (
        <Spin size="large" style={{ display: 'block', marginTop: 40 }} />
      ) : (
        <Row gutter={[24, 24]}>
          {subscriptions.map((sub) => (
            <Col xs={24} sm={12} md={8} lg={6} key={sub.id}>
              <Card
                hoverable
                style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                actions={[
                  <EditOutlined key="edit" onClick={() => handleEdit(sub)} />,
                  <Popconfirm title="Удалить подписку?" onConfirm={() => handleDelete(sub.id)}>
                    <DeleteOutlined key="delete" style={{ color: '#ff4d4f' }} />
                  </Popconfirm>,
                ]}
              >
                <Card.Meta
                  title={<span style={{ fontSize: 18, fontWeight: 500 }}>{sub.name}</span>}
                  description={
                    <div>
                      <div style={{ fontSize: 24, fontWeight: 600, color: '#2563eb', margin: '12px 0' }}>
                        {sub.price} ₽
                        <span style={{ fontSize: 14, fontWeight: 400, color: '#6b7280', marginLeft: 8 }}>
                          / {getPeriodLabel(sub.period)}
                        </span>
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <Tag color="geekblue">{sub.category}</Tag>
                      </div>
                      <div style={{ marginBottom: 4 }}>
                        <span style={{ color: '#6b7280' }}>Следующее списание:</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 500 }}>{dayjs(sub.next_billing_date).format('DD.MM.YYYY')}</span>
                        {getDaysLeftTag(sub.next_billing_date)}
                      </div>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Модальное окно добавления/редактирования */}
      <Modal
        title={editingSub ? 'Редактировать подписку' : 'Новая подписка'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Название" rules={[{ required: true }]}>
            <Input placeholder="Например, Netflix" />
          </Form.Item>
          <Form.Item name="price" label="Цена (₽)" rules={[{ required: true, type: 'number', min: 0 }]}>
            <InputNumber style={{ width: '100%' }} placeholder="999" />
          </Form.Item>
          <Form.Item name="period" label="Период" rules={[{ required: true }]}>
            <Select placeholder="Выберите период">
              <Option value="monthly">Ежемесячно</Option>
              <Option value="yearly">Ежегодно</Option>
            </Select>
          </Form.Item>
          <Form.Item name="category" label="Категория" rules={[{ required: true }]}>
            <Select placeholder="Выберите категорию">
              <Option value="Video">Видео</Option>
              <Option value="Music">Музыка</Option>
              <Option value="Cloud">Облако</Option>
              <Option value="Social">Соцсети</Option>
              <Option value="Other">Другое</Option>
            </Select>
          </Form.Item>
          <Form.Item name="start_date" label="Дата начала" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
          </Form.Item>
          <Form.Item name="next_billing_date" label="Дата следующего списания" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}