import { useState, useMemo } from 'react'
import { Typography, Row, Col, Card, Tag, Button, Empty, Flex, Badge, Space, Radio, Select, Divider } from 'antd'
import {
  ClockCircleOutlined,
  LockOutlined,
  CheckCircleOutlined,
  SlidersOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useMyTasks } from '../hooks/useMyTasks'

const { Title, Text } = Typography

const taskTypeTags = {
  form: { color: 'blue', label: 'Formulário' },
  assignment: { color: 'orange', label: 'Atribuição' },
  approval: { color: 'cyan', label: 'Aprovação' },
  sample_definition: { color: 'magenta', label: 'Amostras' },
  data_template_definition: { color: 'green', label: 'Template de Coleta' },
  review_decision: { color: 'red', label: 'Revisão e Decisão' }
}

const statusTags = {
  pending: { color: 'warning', label: 'Pendente' },
  pending_submission: { color: 'warning', label: 'Aguardando Envio' },
  pending_review: { color: 'processing', label: 'Em Revisão' },
  analyzing_ai: { color: 'purple', label: 'Análise de IA' },
  completed: { color: 'success', label: 'Concluído' }
}

export function TasksPage() {
  const { tasks, isLoading } = useMyTasks()
  const navigate = useNavigate()

  // Estados dos Filtros
  const [actorFilter, setActorFilter] = useState(true) // true = "Minhas Tarefas" (default), false = "Todas as Tarefas"
  const [statusFilter, setStatusFilter] = useState('all') // all, pending, pending_review, completed
  const [typeFilter, setTypeFilter] = useState('all') // all, form, etc.
  const [stepFilter, setStepFilter] = useState('current') // current = "Etapa Ativa" (default), all = "Todas as Etapas"

  const handleResetFilters = () => {
    setActorFilter(true)
    setStatusFilter('all')
    setTypeFilter('all')
    setStepFilter('current')
  }

  const hasActiveFilters = !actorFilter || statusFilter !== 'all' || typeFilter !== 'all' || stepFilter !== 'current'

  // Lista Filtrada de tarefas
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // 0. Filtro: Etapas (Etapa Ativa)
      if (stepFilter === 'current') {
        if (!task.isActiveStep) return false
      }

      // 1. Filtro: Minhas Tarefas (Actor)
      if (actorFilter) {
        if (!task.isMyTask) return false
      }

      // 2. Filtro: Status
      if (statusFilter !== 'all') {
        if (statusFilter === 'completed') {
          if (task.kanbanColumn !== 'completed') return false
        } else if (statusFilter === 'pending_review') {
          if (task.kanbanColumn !== 'review') return false
        } else if (statusFilter === 'pending') {
          if (task.kanbanColumn !== 'todo' && task.kanbanColumn !== 'blocked') return false
        }
      }

      // 3. Filtro: Tipo
      if (typeFilter !== 'all') {
        if (typeFilter === 'form' && task.type !== 'form') return false
        if (typeFilter === 'assignment' && task.type !== 'assignment') return false
        if (typeFilter === 'approval' && (task.type !== 'approval' && task.type !== 'review')) return false
        if (typeFilter === 'sample_definition' && task.type !== 'sample_definition') return false
        if (typeFilter === 'data_template_definition' && task.type !== 'data_template_definition') return false
        if (typeFilter === 'review_decision' && task.type !== 'review_decision') return false
      }

      return true
    })
  }, [tasks, actorFilter, statusFilter, typeFilter, stepFilter])

  // Columns classification
  const todoTasks = filteredTasks.filter(t => t.kanbanColumn === 'todo')
  const reviewTasks = filteredTasks.filter(t => t.kanbanColumn === 'review')
  const blockedTasks = filteredTasks.filter(t => t.kanbanColumn === 'blocked')
  const completedTasks = filteredTasks.filter(t => t.kanbanColumn === 'completed')

  const handleCardClick = (task) => {
    navigate(`/workspace/method/${task.instanceId}?stepId=${task.stepId}&taskId=${task.id}`)
  }

  const renderTaskCard = (t) => {
    const typeConf = taskTypeTags[t.type] || { color: 'default', label: t.type }
    const statusConf = statusTags[t.status] || { color: 'default', label: t.status }

    return (
      <Card
        key={t.id}
        hoverable
        onClick={() => handleCardClick(t)}
        style={{
          borderRadius: '10px',
          border: '1px solid #f0f0f0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.015)',
          marginBottom: '12px',
          transition: 'all 0.2s ease',
          backgroundColor: '#fff'
        }}
        bodyStyle={{ padding: '16px' }}
      >
        <Flex vertical gap={10}>
          <Flex justify="space-between" align="center">
            <Tag color={typeConf.color} style={{ borderRadius: '4px', fontWeight: '500', fontSize: '11px' }}>
              {typeConf.label.toUpperCase()}
            </Tag>
            {t.kanbanColumn !== 'blocked' && t.kanbanColumn !== 'completed' && (
              <Tag color={statusConf.color} style={{ borderRadius: '4px', fontSize: '10px' }}>
                {statusConf.label.toUpperCase()}
              </Tag>
            )}
            {t.kanbanColumn === 'blocked' && (
              <Tag color="error" icon={<LockOutlined />} style={{ borderRadius: '4px', fontSize: '10px' }}>
                BLOQUEADA
              </Tag>
            )}
            {t.kanbanColumn === 'completed' && (
              <Tag color="success" icon={<CheckCircleOutlined />} style={{ borderRadius: '4px', fontSize: '10px' }}>
                CONCLUÍDA
              </Tag>
            )}
          </Flex>

          <Title level={5} style={{ margin: 0, fontSize: '15px', color: '#262626', fontFamily: 'Barlow, sans-serif', fontWeight: '600' }}>
            {t.name}
          </Title>

          <Flex vertical gap={4} style={{ backgroundColor: '#fafafa', padding: '10px', borderRadius: '6px', border: '1px solid #f5f5f5' }}>
            <Flex justify="space-between">
              <Text type="secondary" style={{ fontSize: '12px' }}>Método:</Text>
              <Text strong style={{ fontSize: '12px', color: '#1677ff' }}>{t.formattedInstanceId}</Text>
            </Flex>
            <Flex justify="space-between">
              <Text type="secondary" style={{ fontSize: '12px' }}>Etapa:</Text>
              <Text style={{ fontSize: '12px', color: '#595959', fontWeight: '500' }}>{t.stepName}</Text>
            </Flex>
            <Flex justify="space-between">
              <Text type="secondary" style={{ fontSize: '12px' }}>Responsável:</Text>
              <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>{t.role}</Text>
            </Flex>
          </Flex>
        </Flex>
      </Card>
    )
  }

  const renderColumn = (title, icon, list, bgColor, badgeColor) => {
    return (
      <Col xs={24} sm={12} lg={6}>
        <div style={{
          backgroundColor: bgColor,
          padding: '16px 12px',
          borderRadius: '12px',
          minHeight: '500px',
          height: '100%',
          border: '1px solid #f0f0f0'
        }}>
          <Flex align="center" justify="space-between" style={{ marginBottom: '16px', padding: '0 4px' }}>
            <Space size={8}>
              {icon}
              <Text strong style={{ fontSize: '14px', fontFamily: 'Barlow, sans-serif', color: '#434343', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                {title}
              </Text>
            </Space>
            <Badge count={list.length} showZero style={{ backgroundColor: badgeColor }} />
          </Flex>

          <div style={{ maxHeight: 'calc(100vh - 220px)', overflowY: 'auto', paddingRight: '4px' }}>
            {list.length === 0 ? (
              <Flex vertical align="center" justify="center" style={{ minHeight: '180px', border: '2.5px dashed #e8e8e8', borderRadius: '8px', padding: '16px' }}>
                <Text type="secondary" style={{ fontSize: '12px', textAlign: 'center' }}>Nenhuma tarefa nesta coluna</Text>
              </Flex>
            ) : (
              list.map(t => renderTaskCard(t))
            )}
          </div>
        </div>
      </Col>
    )
  }

  return (
    <div style={{ padding: '24px' }}>
      <Flex justify="space-between" align="center" style={{ marginBottom: '24px' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Kanban</Title>
          <Text type="secondary">Quadro Kanban de acompanhamento de pendências do estudo</Text>
        </div>
        <Button type="default" onClick={() => navigate('/workspace')} style={{ borderRadius: '8px' }}>
          Ir para Meus Métodos
        </Button>
      </Flex>

      {isLoading ? (
        <Card loading style={{ borderRadius: '12px' }} />
      ) : tasks.length === 0 ? (
        <Card style={{ borderRadius: '12px', padding: '48px 0', border: '1.5px solid #f0f0f0' }}>
          <Empty
            description={
              <Flex vertical gap={4} align="center">
                <Text strong style={{ fontSize: '16px' }}>Nenhuma tarefa pendente encontrada.</Text>
                <Text type="secondary">Você está em dia com todas as suas atribuições e responsabilidades!</Text>
              </Flex>
            }
          >
            <Button type="primary" onClick={() => navigate('/workspace')} style={{ borderRadius: '8px' }}>
              Visualizar Meus Métodos
            </Button>
          </Empty>
        </Card>
      ) : (
        <>
          {/* Barra de Filtros (semelhante ao carrossel) */}
          <Card
            style={{
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
              border: '1px solid #f0f0f0',
              marginBottom: '24px',
              background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)'
            }}
            bodyStyle={{ padding: '16px 24px' }}
          >
            <Row gutter={[16, 16]} align="middle" justify="space-between" style={{ width: '100%' }}>
              <Col xs={24} lg={20}>
                <Flex gap={16} wrap="wrap" align="center">
                  <Radio.Group
                    value={actorFilter ? 'my' : 'all'}
                    onChange={(e) => setActorFilter(e.target.value === 'my')}
                    size="middle"
                  >
                    <Radio.Button value="all" style={{ borderRadius: '8px 0 0 8px', fontFamily: 'Lexend, sans-serif' }}>
                      Todas as Tarefas
                    </Radio.Button>
                    <Radio.Button value="my" style={{ borderRadius: '0 8px 8px 0', fontFamily: 'Lexend, sans-serif' }}>
                      Minhas Tarefas
                    </Radio.Button>
                  </Radio.Group>

                  <Divider type="vertical" style={{ height: '24px', margin: 0 }} />

                  <Flex align="center" gap={8}>
                    <span style={{ fontFamily: 'Lexend, sans-serif', color: '#595959', fontSize: '13px' }}>Etapas:</span>
                    <Select
                      value={stepFilter}
                      onChange={setStepFilter}
                      style={{ width: 180, fontFamily: 'Lexend, sans-serif' }}
                      options={[
                        { value: 'current', label: 'Etapa Ativa' },
                        { value: 'all', label: 'Todas as Etapas' }
                      ]}
                    />
                  </Flex>

                  <Flex align="center" gap={8}>
                    <span style={{ fontFamily: 'Lexend, sans-serif', color: '#595959', fontSize: '13px' }}>Status:</span>
                    <Select
                      value={statusFilter}
                      onChange={setStatusFilter}
                      style={{ width: 180, fontFamily: 'Lexend, sans-serif' }}
                      options={[
                        { value: 'all', label: 'Todos' },
                        { value: 'pending', label: 'Pendente' },
                        { value: 'pending_review', label: 'Em Revisão' },
                        { value: 'completed', label: 'Concluída' }
                      ]}
                    />
                  </Flex>

                  <Flex align="center" gap={8}>
                    <span style={{ fontFamily: 'Lexend, sans-serif', color: '#595959', fontSize: '13px' }}>Tipo:</span>
                    <Select
                      value={typeFilter}
                      onChange={setTypeFilter}
                      style={{ width: 180, fontFamily: 'Lexend, sans-serif' }}
                      options={[
                        { value: 'all', label: 'Todos os Tipos' },
                        { value: 'form', label: 'Formulário' },
                        { value: 'assignment', label: 'Atribuição' },
                        { value: 'approval', label: 'Aprovação' },
                        { value: 'sample_definition', label: 'Amostras' },
                        { value: 'data_template_definition', label: 'Templates de Coleta' },
                        { value: 'review_decision', label: 'Revisão e Decisão' }
                      ]}
                    />
                  </Flex>
                </Flex>
              </Col>
              <Col xs={24} lg={4} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {hasActiveFilters && (
                  <Button
                    type="link"
                    onClick={handleResetFilters}
                    style={{ fontFamily: 'Lexend, sans-serif', color: '#ff4d4f', padding: 0 }}
                  >
                    Limpar Filtros
                  </Button>
                )}
              </Col>
            </Row>
          </Card>

          {filteredTasks.length === 0 ? (
            <Card style={{ borderRadius: '12px', padding: '48px 0', border: '1.5px solid #f0f0f0' }}>
              <Empty
                description="Nenhuma tarefa corresponde aos filtros selecionados."
                style={{ padding: '32px 0' }}
              >
                <Button type="primary" onClick={handleResetFilters} style={{ fontFamily: 'Lexend, sans-serif', borderRadius: '8px' }}>
                  Limpar Filtros
                </Button>
              </Empty>
            </Card>
          ) : (
            <Row gutter={[16, 16]}>
              {renderColumn('A Fazer', <ClockCircleOutlined style={{ color: '#fa8c16' }} />, todoTasks, '#fffbe6', '#fa8c16')}
              {renderColumn('Em Revisão', <SlidersOutlined style={{ color: '#1890ff' }} />, reviewTasks, '#e6f7ff', '#1890ff')}
              {renderColumn('Bloqueadas', <LockOutlined style={{ color: '#ff4d4f' }} />, blockedTasks, '#fff1f0', '#f5222d')}
              {renderColumn('Concluídas', <CheckCircleOutlined style={{ color: '#52c41a' }} />, completedTasks, '#f6ffed', '#52c41a')}
            </Row>
          )}
        </>
      )}
    </div>
  )
}

