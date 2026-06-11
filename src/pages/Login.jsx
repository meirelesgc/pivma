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

  // Se já estiver logado, redireciona para o workspace
  if (currentUser) {
    navigate('/workspace')
  }

  if (error) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: 'calc(100vh - 64px)', padding: '24px' }}>
        <Alert message={t('login.errorLoading')} type="error" showIcon />
      </Flex>
    )
  }

  return (
    <Flex justify="center" align="center" style={{ minHeight: 'calc(100vh - 64px)', padding: '24px' }}>
      <Card 
        bordered={false} 
        className="modern-card" 
        style={{ width: 450, boxShadow: 'var(--shadow-l)' }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
          <div>
            <Title level={2} style={{ fontFamily: 'var(--font-accent)', margin: 0 }}>
              {t('login.title')}
            </Title>
            <Text type="secondary">{t('login.instruction')}</Text>
          </div>

          <List
            loading={isLoadingUsers}
            dataSource={users}
            renderItem={user => (
              <List.Item style={{ padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                <Button 
                  block 
                  size="large"
                  onClick={() => login(user.id)}
                  style={{ 
                    height: 54, 
                    borderRadius: 'var(--radius-m)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16
                  }}
                >
                  {t('login.loginAs', { name: user.name })}
                </Button>
              </List.Item>
            )}
            style={{ marginBottom: 16 }}
          />
        </Space>
      </Card>
    </Flex>
  )
}
