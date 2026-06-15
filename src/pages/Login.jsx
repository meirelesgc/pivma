import { useAuth } from '../hooks/useAuth'
import { useUsers } from '../hooks/useUsers'
import { Button, Card, Typography, Space, List, Alert } from 'antd'
import { Navigate } from 'react-router-dom'

const { Text } = Typography

export function LoginPage() {
  const { data: users, isLoading: isLoadingUsers, error } = useUsers()
  const { login, user: currentUser } = useAuth()

  if (currentUser) {
    return <Navigate to="/workspace" replace />
  }

  if (error) {
    return <Alert message="Erro ao carregar usuários" type="error" />
  }

  return (
    <Flex justify="center" align="center">
      <Card title="Login Simulado">
        <Space direction="vertical">
          <Text>Selecione um usuário para entrar:</Text>
          <List
            loading={isLoadingUsers}
            dataSource={users}
            renderItem={user => (
              <List.Item>
                <Button block onClick={() => login(user.id)}>
                  {user.name}
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
