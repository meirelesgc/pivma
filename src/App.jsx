import { useUsers } from './hooks/useUsers'
import { useAuth } from './hooks/useAuth'
import { Button, Card, List, Spin, Typography, Alert, Space } from 'antd'

const { Title, Text } = Typography

function App() {
  const { data: users, isLoading: isLoadingUsers, error: usersError } = useUsers()
  const { user: currentUser, isLoading: isLoadingAuth, login, logout } = useAuth()

  if (isLoadingUsers || isLoadingAuth) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Carregando..." />
      </div>
    )
  }

  if (usersError) {
    return <Alert message="Erro" description="Erro ao carregar usuários" type="error" showIcon />
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card title={<Title level={2}>Autenticação</Title>}>
          {currentUser ? (
            <Space direction="vertical">
              <Text>Bem-vindo, <strong>{currentUser.name}</strong> ({currentUser.email})</Text>
              <Button onClick={() => logout()}>Sair</Button>
            </Space>
          ) : (
            <Space direction="vertical">
              <Text>Você não está autenticado.</Text>
              <Space>
                {users?.map(user => (
                  <Button key={user.id} onClick={() => login(user.id)}>
                    Entrar como {user.name}
                  </Button>
                ))}
              </Space>
            </Space>
          )}
        </Card>

        <Card title={<Title level={2}>Lista de Usuários</Title>}>
          <List
            dataSource={users}
            renderItem={user => (
              <List.Item>
                <List.Item.Meta
                  title={user.name}
                  description={user.email}
                />
              </List.Item>
            )}
          />
        </Card>
      </Space>
    </div>
  )
}

export default App
