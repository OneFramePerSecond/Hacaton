import { Card, Row, Col, Spin, Statistic } from 'antd';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';
import api from '../api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/analytics')
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spin size="large" />;

  return (
    <div>
      <Row gutter={16}>
        <Col span={24}>
          <Card title="Прогноз на год" style={{ marginBottom: 20 }}>
            <Statistic value={data.yearly_forecast} suffix="₽" precision={2} />
          </Card>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Card title="По категориям">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={data.category_totals} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={80} label>
                  {data.category_totals.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Динамика по месяцам">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.monthly_totals}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
}