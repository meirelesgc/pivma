import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useUsers } from '../hooks/useUsers'
import { useProcesses } from '../hooks/useProcesses'
import { Button, Card, Typography, Space, List, Alert, Flex, Tabs, Form, Input, message, Collapse } from 'antd'
import { Navigate } from 'react-router-dom'
import { UserOutlined, MailOutlined, UserAddOutlined, LoginOutlined } from '@ant-design/icons'

const { Text, Title } = Typography

export function LoginPage() {
  const { data: users = [], isLoading: isLoadingUsers, error } = useUsers()
  const { login, user: currentUser } = useAuth()
  const { registerUserAsync } = useProcesses()
  const [form] = Form.useForm()
  const [isRegistering, setIsRegistering] = useState(false)

  if (currentUser) {
    return <Navigate to="/workspace" replace />
  }

  if (error) {
    return <Alert message="Erro ao carregar usuários" type="error" />
  }

  const handleRegister = async (values) => {
    setIsRegistering(true)
    try {
      const newUser = await registerUserAsync({
        name: values.name,
        email: values.email
      })
      message.success(`Conta criada com sucesso para ${newUser.name}!`)
      login(newUser.id)
    } catch (err) {
      message.error('Erro ao realizar o cadastro.')
      console.error(err)
    } finally {
      setIsRegistering(false)
    }
  }

  const mainUsers = users.filter(u => !u.email.endsWith('@system.com'))
  const systemPlaceholders = users.filter(u => u.email.endsWith('@system.com'))

  const items = [
    {
      key: 'login',
      label: (
        <span style={{ fontFamily: 'Lexend, sans-serif', fontWeight: '500' }}>
          <LoginOutlined /> Entrar
        </span>
      ),
      children: (
        <Space direction="vertical" style={{ width: '100%' }} size={16}>
          <Text type="secondary" style={{ fontFamily: 'Lexend, sans-serif' }}>
            Selecione um perfil de teste para acessar o painel:
          </Text>
          <List
            loading={isLoadingUsers}
            dataSource={mainUsers}
            renderItem={user => (
              <List.Item style={{ padding: '6px 0' }}>
                <Button
                  block
                  icon={<UserOutlined />}
                  onClick={() => login(user.id)}
                  style={{
                    height: '42px',
                    borderRadius: '8px',
                    textAlign: 'left',
                    fontWeight: '500',
                    fontFamily: 'Lexend, sans-serif'
                  }}
                >
                  {user.name} ({user.email})
                </Button>
              </List.Item>
            )}
          />

          {systemPlaceholders.length > 0 && (
            <Collapse
              ghost
              size="small"
              style={{ marginTop: '8px' }}
              items={[
                {
                  key: 'placeholders',
                  label: (
                    <span style={{ fontFamily: 'Lexend, sans-serif', fontWeight: '600', color: '#1677ff', cursor: 'pointer' }}>
                      Perfis por Cargo (Placeholders do Sistema)
                    </span>
                  ),
                  children: (
                    <div style={{ maxHeight: '220px', overflowY: 'auto', paddingRight: '4px' }}>
                      <List
                        dataSource={systemPlaceholders}
                        renderItem={user => (
                          <List.Item style={{ padding: '4px 0' }}>
                            <Button
                              block
                              icon={<UserOutlined />}
                              onClick={() => login(user.id)}
                              style={{
                                height: '36px',
                                borderRadius: '6px',
                                textAlign: 'left',
                                fontSize: '13px',
                                fontFamily: 'Lexend, sans-serif'
                              }}
                            >
                              {user.name}
                            </Button>
                          </List.Item>
                        )}
                      />
                    </div>
                  )
                }
              ]}
            />
          )}
        </Space>
      )
    },
    {
      key: 'register',
      label: (
        <span style={{ fontFamily: 'Lexend, sans-serif', fontWeight: '500' }}>
          <UserAddOutlined /> Criar Conta
        </span>
      ),
      children: (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleRegister}
          requiredMark={false}
          style={{ marginTop: '8px' }}
        >
          <Form.Item
            name="name"
            label="Nome Completo"
            rules={[{ required: true, message: 'Por favor, informe seu nome!' }]}
          >
            <Input prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} placeholder="Seu nome completo" style={{ height: '40px', borderRadius: '8px' }} />
          </Form.Item>

          <Form.Item
            name="email"
            label="E-mail"
            rules={[
              { required: true, message: 'Por favor, informe seu e-mail!' },
              { type: 'email', message: 'Por favor, informe um e-mail válido!' }
            ]}
          >
            <Input prefix={<MailOutlined style={{ color: '#bfbfbf' }} />} placeholder="exemplo@email.com" style={{ height: '40px', borderRadius: '8px' }} />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={isRegistering}
              block
              style={{
                height: '42px',
                borderRadius: '8px',
                fontWeight: '600',
                fontFamily: 'Lexend, sans-serif',
                marginTop: '12px'
              }}
            >
              Criar Conta e Entrar
            </Button>
          </Form.Item>
        </Form>
      )
    }
  ]

  return (
    <Flex justify="center" align="center" style={{ minHeight: '80vh', padding: '24px' }}>
      <Card
        style={{
          width: '100%',
          maxWidth: '450px',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          border: '1px solid #f0f0f0'
        }}
        bodyStyle={{ padding: '32px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Title level={3} style={{ margin: 0, fontFamily: 'Barlow, sans-serif', fontWeight: '700' }}>
            BraCVAM Portal
          </Title>
          <Text type="secondary" style={{ fontFamily: 'Lexend, sans-serif' }}>
            Validação Integrada de Métodos Alternativos
          </Text>
        </div>
        <Tabs defaultActiveKey="login" items={items} />
      </Card>
    </Flex>
  )
}
