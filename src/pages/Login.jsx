import { useAuth } from '../hooks/useAuth'
import { useUsers } from '../hooks/useUsers'
import { Button, Card, Typography, Space, List, Alert } from 'antd'
import { useNavigate } from 'react-router-dom'

const { Title, Text } = Typography

export function LoginPage() {
  const { data: users, isLoading: isLoadingUsers, error } = useUsers()
  const { login, user: currentUser } = useAuth()
  const navigate = useNavigate()

  // Se já estiver logado, redireciona para o dashboard
  if (currentUser) {
    navigate('/dashboard')
  }

  if (error) {
    return <Alert message="Erro ao carregar usuários" type="error" />
  }

  return (
    <Flex justify="center" align="center" style={{ minHeight: '100vh' }}>
      <Card title="Login Simulado" style={{ width: 400 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text>Selecione um usuário para entrar:</Text>
          <List
            loading={isLoadingUsers}
            dataSource={users}
            renderItem={user => (
              <List.Item>
                <Button block onClick={() => login(user.id)}>
                  Entrar como {user.name}
                </Button>
              </List.Item>
            )}
          />
        </Space>
      </Card>
    </Flex>
  )
}

import { Flex } from 'antd'
