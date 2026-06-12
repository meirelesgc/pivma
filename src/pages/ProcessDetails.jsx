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
  Breadcrumb,
  Space,
  Divider,
  Row,
  Col,
  message
} from 'antd'
import {
  ClockCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
  LockOutlined,
  RightOutlined,
  LeftOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons'
import { TaskRenderer } from '../components/tasks/TaskRenderer'

const { Title, Text } = Typography

export function ProcessDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const { data: process, isLoading, error } = useProcessDetails(id)

  const [selectedTaskId, setSelectedTaskId] = React.useState(null)

  const carouselRef = React.useRef(null)

  const myParticipant = process?.participants?.find(p => p.user_id === user?.id)
  let myRoleId = myParticipant?.process_role_id
  let myRoleName = myParticipant?.role_name || 'Sem cargo'

  if (!myRoleId && user?.system_role === 'admin') {
    myRoleId = 4
    myRoleName = 'Coordenador do Grupo Gestor'
  }

  const visibleTasks = process?.tasks?.filter(t => !t.viewer_roles || t.viewer_roles.includes(myRoleId)) || []

  React.useEffect(() => {
    if (process && !selectedTaskId) {
      setSelectedTaskId(process.current_task_id)
    }
  }, [process, selectedTaskId])

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

  const getResponsibility = (taskType) => {
    if (taskType === 'approval') return 'BRACVAM'
    if (taskType === 'ai_review') return 'IA'
    return 'Proponente'
  }

  const getDeadline = (taskType) => {
    if (taskType === 'approval') return '7 dias úteis'
    return 'Imediato'
  }

  const getStatusTag = (status) => {
    switch (status) {
      case 'completed':
        return <Tag color="success" style={{ borderRadius: 'var(--radius-pill)', margin: 0 }}>Concluída</Tag>
      case 'pending':
      case 'in_progress':
        return <Tag color="processing" style={{ borderRadius: 'var(--radius-pill)', margin: 0 }}>Em andamento</Tag>
      case 'locked':
      default:
        return <Tag color="default" style={{ borderRadius: 'var(--radius-pill)', margin: 0 }}>Bloqueada</Tag>
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleOutlined style={{ color: 'var(--ant-success-color, #52c41a)', fontSize: '20px' }} />
      case 'pending':
      case 'in_progress':
        return <PlayCircleOutlined style={{ color: 'var(--primary-color)', fontSize: '20px' }} />
      case 'locked':
      default:
        return <LockOutlined style={{ color: 'var(--text-tertiary, #bfbfbf)', fontSize: '20px' }} />
    }
  }

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 240
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <main className="workspace-content fade-in">
      <Flex vertical gap={24}>
        <Flex align="center" justify="space-between">
          <Flex align="center" gap={16}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined style={{ color: '#16a34a' }} />}
              onClick={() => navigate('/workspace')}
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
              <Text type="secondary" style={{ fontSize: '14px' }}>ID: {process.id}</Text>
              <Title level={4} style={{ margin: 0, fontFamily: "var(--font-accent)", fontWeight: 400 }}>
                {process.type_name}: {process.title}
              </Title>
            </Flex>
          </Flex>
          <Tag style={{ margin: 0, padding: '6px 16px', fontSize: '14px', borderRadius: '4px', backgroundColor: '#fffbe6', color: '#d48806', border: 'none' }}>
            {process.status === 'active' ? 'Em Andamento' : process.status}
          </Tag>
        </Flex>

        {visibleTasks && visibleTasks.length > 0 && (
          <Card
            bordered={false}
            className="modern-card"
            title={
              <Text strong style={{ fontSize: '15px' }}>
                Progresso das Tarefas da Etapa: {process.current_stage_name}
              </Text>
            }
            styles={{ body: { padding: '16px 24px' } }}
          >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Button
                type="text"
                shape="circle"
                icon={<LeftOutlined />}
                onClick={() => scrollCarousel('left')}
                style={{ position: 'absolute', left: -12, zIndex: 10, background: '#fff', boxShadow: 'var(--shadow-s)' }}
              />

              <div
                ref={carouselRef}
                style={{
                  display: 'flex',
                  overflowX: 'auto',
                  gap: '16px',
                  padding: '8px 4px',
                  width: '100%',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
                className="hide-scrollbar"
              >
                {visibleTasks.map((t) => {
                  const isSelected = selectedTaskId === t.task_id
                  const isLocked = t.status === 'locked'

                  return (
                    <Card key={t.id} hoverable={!isLocked} styles={{ body: { padding: '16px' } }} style={{ minWidth: '240px', width: '220px', borderRadius: 'var(--radius-m)', border: isSelected ? '2px solid var(--primary-color)' : '1px solid var(--border-color)', background: isLocked ? '#fafafa' : '#fff', cursor: isLocked ? 'not-allowed' : 'pointer', opacity: isLocked ? 0.7 : 1 }}
                      onClick={() => {
                        if (!isLocked) {
                          setSelectedTaskId(t.task_id)
                        } else {
                          message.warning('Esta tarefa está bloqueada. Conclua as anteriores primeiro.')
                        }
                      }}>
                      <Flex vertical gap={12}>
                        <div>
                          <Flex justify="space-between" align="center" gap={8}>
                            <Text strong ellipsis={{ tooltip: t.name }} style={{ fontSize: '13px', flex: 1 }} >
                              {t.name}
                            </Text>
                            {getStatusTag(t.status)}
                          </Flex>
                          <Divider style={{ margin: '8px 0' }} />
                          <Flex vertical gap={2}>
                            <Text type="secondary" style={{ fontSize: '11px' }}>
                              Prazo: <Text strong style={{ fontSize: '11px' }}>{getDeadline(t.task_type)}</Text>
                            </Text>
                            <Text type="secondary" style={{ fontSize: '11px' }}>
                              Resp: <Text strong style={{ fontSize: '11px' }}>{getResponsibility(t.task_type)}</Text>
                            </Text>
                          </Flex>
                        </div>
                      </Flex>
                    </Card>
                  )
                })}
              </div>

              <Button
                type="text"
                shape="circle"
                icon={<RightOutlined />}
                onClick={() => scrollCarousel('right')}
                style={{ position: 'absolute', right: -12, zIndex: 10, background: '#fff', boxShadow: 'var(--shadow-s)' }}
              />
            </div>
          </Card>
        )}

        <Card bordered={false} className="modern-card" style={{ minHeight: '300px' }}>
          <TaskRenderer
            processId={process.id}
            taskId={selectedTaskId || process.current_task_id}
            currentStageId={process.current_stage_id}
            myRoleId={myRoleId}
            myRoleName={myRoleName}
          />
        </Card>
      </Flex>
    </main>
  )
}