import { useAuth } from '../hooks/useAuth'
import { Button, Card, Typography, Space, Layout } from 'antd'

const { Header, Content } = Layout
const { Title, Text } = Typography

export function DashboardPage() {
  const { user, logout } = useAuth()

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '0 24px' }}>
        <Title level={4} style={{ margin: 0 }}>Dashboard BraCVAM</Title>
        <Space>
          <Text>Olá, <strong>{user?.name}</strong></Text>
          <Button onClick={() => logout()}>Sair</Button>
        </Space>
      </Header>
      <Content style={{ padding: '24px' }}>
        <Card title="Área Logada">
          <Text>Você acessou a plataforma com sucesso! Aqui ficarão as funcionalidades restritas.</Text>
        </Card>
      </Content>
    </Layout>
  )
}
