import { useAuth } from '../hooks/useAuth'
import { Button, Card, Typography, Space, Layout } from 'antd'
import { useTranslation } from 'react-i18next'

const { Header, Content } = Layout
const { Title, Text } = Typography

export function DashboardPage() {
  const { user, logout } = useAuth()
  const { t } = useTranslation()

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '0 24px' }}>
        <Title level={4} style={{ margin: 0 }}>{t('dashboard.header')}</Title>
        <Space>
          <Text>{t('dashboard.welcome', { name: user?.name })}</Text>
          <Button onClick={() => logout()}>{t('dashboard.logout')}</Button>
        </Space>
      </Header>
      <Content style={{ padding: '24px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Card title={t('dashboard.loggedArea')}>
            <Text>{t('dashboard.successMessage')}</Text>
          </Card>
          <Card title={t('dashboard.metricsSection')}>
             {/* Placeholder for metrics */}
          </Card>
        </Space>
      </Content>
    </Layout>
  )
}
