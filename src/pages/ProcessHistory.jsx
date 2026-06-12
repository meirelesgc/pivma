import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProcessDetails, useProcessEvents } from '../hooks/useProcesses'
import {
  Typography,
  Card,
  Flex,
  Button,
  Result,
  Skeleton,
  Timeline,
  Space
} from 'antd'
import {
  ArrowLeftOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography

export function ProcessHistoryPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: process, isLoading: isLoadingDetails, error: errorDetails } = useProcessDetails(id)
  const { data: events, isLoading: isLoadingEvents, error: errorEvents } = useProcessEvents(id)

  const isLoading = isLoadingDetails || isLoadingEvents
  const error = errorDetails || errorEvents

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

  const timelineItems = events?.map(event => {
    let color = 'gray'
    if (event.event_type === 'submission') color = 'blue'
    if (event.event_type === 'approval') color = 'green'
    if (event.event_type === 'contestation') color = 'red'
    if (event.event_type === 'task_completed') color = 'green'
    if (event.event_type === 'adjustments_requested') color = 'orange'

    return {
      color: color,
      children: (
        <Space direction="vertical" size={2} style={{ paddingBottom: '12px' }}>
          <Text strong style={{ fontSize: '14px' }}>{event.description}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {new Date(event.created_at).toLocaleString()}
          </Text>
        </Space>
      )
    }
  }) || []

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
              Histórico de Eventos e Trilha de Auditoria
            </Title>
          </Flex>
        </Flex>

        <Card bordered={false} className="modern-card" styles={{ body: { padding: '32px 24px' } }}>
          {timelineItems.length > 0 ? (
            <div style={{ marginTop: '16px' }}>
              <Timeline items={timelineItems} />
            </div>
          ) : (
            <Text type="secondary">Nenhum evento registrado no histórico deste processo.</Text>
          )}
        </Card>
      </Flex>
    </main>
  )
}
