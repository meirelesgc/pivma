import { useAuth } from '../hooks/useAuth'
import { useUsers } from '../hooks/useUsers'
import { Button, Card, Typography, Space, List, Alert, Flex } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const { Title, Text } = Typography

export function LoginPage() {
  const { data: users, isLoading: isLoadingUsers, error } = useUsers()
  const { login, user: currentUser } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  // Se já estiver logado, redireciona para o dashboard
  if (currentUser) {
    navigate('/dashboard')
  }

  if (error) {
    return <Alert message={t('login.errorLoading')} type="error" />
  }

  return (
    <Flex justify="center" align="center" style={{ minHeight: '100vh' }}>
      <Card title={t('login.title')} style={{ width: 400 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text>{t('login.instruction')}</Text>
          <List
            loading={isLoadingUsers}
            dataSource={users}
            renderItem={user => (
              <List.Item>
                <Button block onClick={() => login(user.id)}>
                  {t('login.loginAs', { name: user.name })}
                </Button>
              </List.Item>
            )}
          />
        </Space>
      </Card>
    </Flex>
  )
}
