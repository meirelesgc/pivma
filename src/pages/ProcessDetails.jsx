import { useParams, useNavigate } from 'react-router-dom'
import { useProcessDetails } from '../hooks/useProcesses'
import {
  Typography,
  Card,
  Flex,
  Tag,
  Button,
  Result,
  Skeleton,
  Space,
  Divider
} from 'antd'
import { ClockCircleOutlined, UserOutlined } from '@ant-design/icons'
import { TaskRenderer } from '../components/tasks/TaskRenderer'

const { Title, Text } = Typography

export function ProcessDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()

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
        <Card bordered={false} className="modern-card">
          <Flex justify="space-between" align="flex-start" wrap="wrap" gap={16}>
            <Space direction="vertical" size={4}>
              <Tag color="blue" style={{ borderRadius: 'var(--radius-pill)', margin: 0 }}>
                {process.type_name}
              </Tag>
              <Title level={3} style={{ margin: 0, fontFamily: "var(--font-accent)" }}>
                {process.title}
              </Title>
              <Text type="secondary">ID: {process.id} • Iniciado em {new Date(process.created_at).toLocaleDateString()}</Text>
            </Space>

            <Tag color={process.status === 'active' ? 'success' : 'warning'} style={{ borderRadius: 'var(--radius-pill)', padding: '4px 12px' }}>
              {process.status === 'active' ? 'EM ANDAMENTO' : process.status.toUpperCase()}
            </Tag>
          </Flex>

          <Divider style={{ margin: '24px 0' }} />

          <Flex vertical gap={16}>
            <Flex align="center" gap={8}>
              <ClockCircleOutlined style={{ color: 'var(--primary-color)' }} />
              <Text strong>Etapa Atual:</Text>
              <Tag color="processing" style={{ borderRadius: 'var(--radius-pill)' }}>
                {process.current_stage_name}
              </Tag>
            </Flex>

            <Flex align="center" gap={8}>
              <UserOutlined style={{ color: 'var(--primary-color)' }} />
              <Text strong>Tarefa Pendente:</Text>
              <Text>{process.current_task_name}</Text>
            </Flex>
          </Flex>
        </Card>

        {/* Renderização Dinâmica da Tarefa Atual */}
        <Card bordered={false} className="modern-card" style={{ minHeight: '300px' }}>
          <TaskRenderer processId={process.id} taskId={process.current_task_id} currentStageId={process.current_stage_id} />
        </Card>

      </Flex>
    </main>
  )
}
