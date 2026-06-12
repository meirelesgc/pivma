import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProcessDetails } from '../hooks/useProcesses'
import { useAuth } from '../hooks/useAuth'
import {
  Typography,
  Card,
  Flex,
  Tag,
  Button,
  Result,
  Skeleton,
  List,
  Avatar,
  Space
} from 'antd'
import {
  ArrowLeftOutlined,
  UserOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography

export function ProcessParticipantsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const { data: process, isLoading, error } = useProcessDetails(id)

  if (isLoading) {
    return (
      <main className="workspace-content fade-in">
        <Skeleton active paragraph={{ rows: 10 }} />
      </main>
    )
  }

  if (error || !process) {
    return (
      <Result
        status="404"
        title="Processo não encontrado"
        subTitle="O processo que você está procurando não existe ou você não tem permissão para acessá-lo."
        extra={<Button type="primary" onClick={() => navigate('/workspace')}>Voltar para Área de Trabalho</Button>}
      />
    )
  }

  return (
    <main className="workspace-content fade-in">
      <Flex vertical gap={24}>
        <Flex align="center" gap={16}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined style={{ color: '#16a34a' }} />}
            onClick={() => navigate(`/workspace/processes/${id}`)}
            style={{
              backgroundColor: '#f0fdf4',
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          />
          <Flex vertical gap={4}>
            <Text type="secondary" style={{ fontSize: '14px' }}>Processo: {process.title}</Text>
            <Title level={4} style={{ margin: 0, fontFamily: "var(--font-accent)", fontWeight: 400 }}>
              Participantes do Processo
            </Title>
          </Flex>
        </Flex>

        <Card bordered={false} className="modern-card" styles={{ body: { padding: '24px' } }}>
          {process.participants && process.participants.length > 0 ? (
            <List
              itemLayout="horizontal"
              dataSource={process.participants}
              renderItem={(p) => (
                <List.Item style={{ padding: '16px 0' }}>
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        size="large"
                        icon={<UserOutlined />} 
                        style={{ 
                          backgroundColor: p.user_id === user?.id ? 'var(--primary-color)' : '#e2e8f0',
                          color: p.user_id === user?.id ? '#fff' : '#64748b'
                        }} 
                      />
                    }
                    title={
                      <Space size={8}>
                        <Text strong style={{ fontSize: '15px' }}>{p.user_name}</Text>
                        {p.user_id === user?.id && <Tag color="gold" style={{ margin: 0, fontSize: '10px' }}>Você</Tag>}
                      </Space>
                    }
                    description={<Text type="secondary" style={{ fontSize: '13px' }}>{p.role_name}</Text>}
                  />
                </List.Item>
              )}
            />
          ) : (
            <Text type="secondary">Nenhum participante associado a este processo.</Text>
          )}
        </Card>
      </Flex>
    </main>
  )
}
