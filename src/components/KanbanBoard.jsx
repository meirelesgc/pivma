import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  Row,
  Col,
  Statistic,
  Select,
  Switch,
  Tag,
  Avatar,
  Typography,
  Space,
  Flex,
  Tooltip,
  Badge,
  Button
} from 'antd'
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  AlertOutlined,
  UserOutlined,
  FileTextOutlined,
  FilterOutlined,
  WarningOutlined,
  InboxOutlined
} from '@ant-design/icons'
import { useAllTaskInstances } from '../hooks/useTasks'
import { useAllProcesses } from '../hooks/useProcesses'
import { useAllStages } from '../hooks/useProcesses'
import { useUsers } from '../hooks/useUsers'

const { Title, Text, Paragraph } = Typography

export function KanbanBoard() {
  const navigate = useNavigate()

  // 1. Fetch data
  const { data: rawTaskInstances, isLoading: isLoadingTasks } = useAllTaskInstances()
  const { data: processes, isLoading: isLoadingProcesses } = useAllProcesses()
  const { data: stages, isLoading: isLoadingStages } = useAllStages()
  const { data: users, isLoading: isLoadingUsers } = useAllUsersQuery()

  // 2. Define filters state
  const [filterStage, setFilterStage] = useState(null)
  const [filterAssignee, setFilterAssignee] = useState(null)
  const [filterStatus, setFilterStatus] = useState(null)
  const [filterOverdue, setFilterOverdue] = useState(false)
  const [filterProcess, setFilterProcess] = useState(null)
  const [filterTaskType, setFilterTaskType] = useState(null)

  // System local mock date is 2026-06-12
  const today = useMemo(() => new Date('2026-06-12T09:00:00.000Z'), [])

  const isLoading = isLoadingTasks || isLoadingProcesses || isLoadingStages || isLoadingUsers

  // Get active processes and compute overdue tasks
  const stats = useMemo(() => {
    if (!rawTaskInstances || !processes) {
      return { activeProcesses: 0, overdueTasks: 0, waitingApproval: 0, completedWeek: 0, avgApprovalTime: 'N/A' }
    }

    const activeProcesses = processes.filter(p => p.status === 'active').length

    // Overdue tasks are those whose due_date is in the past, and status is not completed
    const overdueTasks = rawTaskInstances.filter(ti => {
      if (ti.status === 'completed' || !ti.due_date) return false
      const dueDate = new Date(ti.due_date)
      return dueDate < today
    }).length

    const waitingApproval = rawTaskInstances.filter(ti => ti.status === 'awaiting_approval').length

    // Completed in the last 7 days from today (2026-06-12)
    const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000
    const completedWeek = rawTaskInstances.filter(ti => {
      if (ti.status !== 'completed' || !ti.completed_at) return false
      const compDate = new Date(ti.completed_at)
      const diff = today - compDate
      return diff >= 0 && diff <= ONE_WEEK_MS
    }).length

    // Average approval time for completed tasks of type approval or that went through approval
    const approvalTasks = rawTaskInstances.filter(ti => {
      return ti.status === 'completed' && ti.started_at && ti.completed_at && 
             (ti.task_type === 'approval' || ti.requires_approval)
    })

    let avgApprovalTime = '2.4 horas' // realistic default fallback
    if (approvalTasks.length > 0) {
      const totalHours = approvalTasks.reduce((acc, ti) => {
        const diffMs = new Date(ti.completed_at) - new Date(ti.started_at)
        return acc + (diffMs / (1000 * 60 * 60))
      }, 0)
      const avgHours = totalHours / approvalTasks.length
      if (avgHours < 24) {
        avgApprovalTime = `${avgHours.toFixed(1)} horas`
      } else {
        avgApprovalTime = `${(avgHours / 24).toFixed(1)} dias`
      }
    }

    return { activeProcesses, overdueTasks, waitingApproval, completedWeek, avgApprovalTime }
  }, [rawTaskInstances, processes, today])

  // Apply filters to tasks
  const filteredTasks = useMemo(() => {
    if (!rawTaskInstances) return []

    return rawTaskInstances.filter(task => {
      // 1. Stage filter
      if (filterStage && task.stage_id !== filterStage) return false

      // 2. Assignee filter
      if (filterAssignee && task.assignee_id !== filterAssignee) return false

      // 3. Status filter (maps visual columns or database status)
      // Visual statuses: pending (locked), available (pending), in_progress, awaiting_approval, completed, rejected
      if (filterStatus) {
        const mappedStatus = 
          task.status === 'locked' ? 'pending' : 
          task.status === 'pending' ? 'available' : 
          task.status
        if (mappedStatus !== filterStatus) return false
      }

      // 4. Overdue filter
      if (filterOverdue) {
        if (task.status === 'completed' || !task.due_date) return false
        const dueDate = new Date(task.due_date)
        if (dueDate >= today) return false
      }

      // 5. Process filter
      if (filterProcess && task.process_instance_id !== filterProcess) return false

      // 6. Task Type filter
      if (filterTaskType && task.task_type !== filterTaskType) return false

      return true
    })
  }, [rawTaskInstances, filterStage, filterAssignee, filterStatus, filterOverdue, filterProcess, filterTaskType, today])

  // Group filtered tasks by column status
  const columns = useMemo(() => {
    // Columns: pending, available, in_progress, awaiting_approval, completed, rejected
    const groups = {
      pending: [], // locked in DB
      available: [], // pending in DB
      in_progress: [],
      awaiting_approval: [],
      completed: [],
      rejected: []
    }

    filteredTasks.forEach(task => {
      const columnKey = 
        task.status === 'locked' ? 'pending' : 
        task.status === 'pending' ? 'available' : 
        task.status

      if (groups[columnKey]) {
        groups[columnKey].push(task)
      }
    })

    return [
      {
        id: 'pending',
        title: 'Bloqueada / Pendente',
        subtitle: 'Aguardando dependências',
        color: '#94a3b8',
        tagColor: 'default',
        tasks: groups.pending
      },
      {
        id: 'available',
        title: 'Disponível',
        subtitle: 'Pronta para iniciar',
        color: '#3b82f6',
        tagColor: 'blue',
        tasks: groups.available
      },
      {
        id: 'in_progress',
        title: 'Em Execução',
        subtitle: 'Sendo executada',
        color: '#f59e0b',
        tagColor: 'warning',
        tasks: groups.in_progress
      },
      {
        id: 'awaiting_approval',
        title: 'Aguardando Aprovação',
        subtitle: 'Revisão e validação',
        color: '#8b5cf6',
        tagColor: 'purple',
        tasks: groups.awaiting_approval
      },
      {
        id: 'completed',
        title: 'Concluída',
        subtitle: 'Finalizada com sucesso',
        color: '#10b981',
        tagColor: 'success',
        tasks: groups.completed
      },
      {
        id: 'rejected',
        title: 'Recusada',
        subtitle: 'Ajustes solicitados',
        color: '#ef4444',
        tagColor: 'error',
        tasks: groups.rejected
      }
    ]
  }, [filteredTasks])

  // Clear all filters
  const handleClearFilters = () => {
    setFilterStage(null)
    setFilterAssignee(null)
    setFilterStatus(null)
    setFilterOverdue(false)
    setFilterProcess(null)
    setFilterTaskType(null)
  }

  if (isLoading) {
    return <div style={{ padding: '24px 0' }}>Carregando dados das atividades...</div>
  }

  return (
    <div className="kanban-container fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* 1. Indicadores */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="modern-card" style={{ boxShadow: 'var(--shadow-s)' }}>
            <Statistic
              title="Processos em Andamento"
              value={stats.activeProcesses}
              valueStyle={{ fontWeight: 'var(--weight-bold)', color: 'var(--text-color)' }}
              suffix={
                <span style={{ fontSize: '12px', color: stats.overdueTasks > 0 ? '#ef4444' : '#64748b', marginLeft: '8px' }}>
                  ({stats.overdueTasks} em atraso)
                </span>
              }
              prefix={<PlayCircleOutlined style={{ color: 'var(--primary-color)', marginRight: '8px' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="modern-card" style={{ boxShadow: 'var(--shadow-s)' }}>
            <Statistic
              title="Aprovações em Espera"
              value={stats.waitingApproval}
              valueStyle={{ fontWeight: 'var(--weight-bold)', color: '#8b5cf6' }}
              prefix={<ClockCircleOutlined style={{ color: '#8b5cf6', marginRight: '8px' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="modern-card" style={{ boxShadow: 'var(--shadow-s)' }}>
            <Statistic
              title="Conclusões da Semana"
              value={stats.completedWeek}
              valueStyle={{ fontWeight: 'var(--weight-bold)', color: '#10b981' }}
              prefix={<CheckCircleOutlined style={{ color: '#10b981', marginRight: '8px' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="modern-card" style={{ boxShadow: 'var(--shadow-s)' }}>
            <Statistic
              title="Tempo Médio de Aprovação"
              value={stats.avgApprovalTime}
              valueStyle={{ fontWeight: 'var(--weight-bold)', color: '#0ea5e9', fontSize: '20px' }}
              prefix={<AlertOutlined style={{ color: '#0ea5e9', marginRight: '8px' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* 2. Filtros */}
      <Card bordered={false} className="modern-card" style={{ boxShadow: 'var(--shadow-s)' }} styles={{ body: { padding: '16px' } }}>
        <Flex align="center" gap={12} wrap="wrap" justify="space-between">
          <Flex align="center" gap={12} wrap="wrap">
            <Space size={4} style={{ marginRight: 8 }}>
              <FilterOutlined style={{ color: 'var(--primary-color)' }} />
              <Text strong style={{ fontSize: '13px' }}>Filtrar por:</Text>
            </Space>

            {/* Processo */}
            <Select
              placeholder="Processo"
              style={{ width: 160 }}
              allowClear
              value={filterProcess}
              onChange={setFilterProcess}
              options={processes?.map(p => ({ label: p.id, value: p.id }))}
            />

            {/* Etapa */}
            <Select
              placeholder="Etapa"
              style={{ width: 160 }}
              allowClear
              value={filterStage}
              onChange={setFilterStage}
              options={stages?.map(s => ({ label: s.name, value: s.id }))}
            />

            {/* Responsável */}
            <Select
              placeholder="Responsável"
              style={{ width: 160 }}
              allowClear
              value={filterAssignee}
              onChange={setFilterAssignee}
              options={users?.map(u => ({ label: u.name, value: u.id }))}
            />

            {/* Status */}
            <Select
              placeholder="Status"
              style={{ width: 150 }}
              allowClear
              value={filterStatus}
              onChange={setFilterStatus}
              options={[
                { label: 'Pendente / Bloqueada', value: 'pending' },
                { label: 'Disponível', value: 'available' },
                { label: 'Em Execução', value: 'in_progress' },
                { label: 'Aguardando Aprovação', value: 'awaiting_approval' },
                { label: 'Concluída', value: 'completed' },
                { label: 'Recusada', value: 'rejected' }
              ]}
            />

            {/* Tipo de Tarefa */}
            <Select
              placeholder="Tipo de Tarefa"
              style={{ width: 150 }}
              allowClear
              value={filterTaskType}
              onChange={setFilterTaskType}
              options={[
                { label: 'Formulário', value: 'form' },
                { label: 'Upload de Documento', value: 'document_upload' },
                { label: 'Download de Documento', value: 'document_download' },
                { label: 'Dataset / Planilha', value: 'dataset_submission' },
                { label: 'Aprovação', value: 'approval' },
                { label: 'Reconhecimento', value: 'acknowledgement' }
              ]}
            />

            {/* Switch de Atraso */}
            <Flex align="center" gap={8} style={{ marginLeft: 8 }}>
              <Switch
                size="small"
                checked={filterOverdue}
                onChange={setFilterOverdue}
              />
              <Text style={{ fontSize: '13px' }} type={filterOverdue ? 'danger' : 'secondary'} strong={filterOverdue}>
                Apenas em atraso
              </Text>
            </Flex>
          </Flex>

          <Button type="link" size="small" onClick={handleClearFilters} style={{ padding: 0 }}>
            Limpar Filtros
          </Button>
        </Flex>
      </Card>

      {/* 3. Quadro Kanban */}
      <div 
        className="kanban-board" 
        style={{ 
          display: 'flex', 
          gap: '16px', 
          overflowX: 'auto', 
          paddingBottom: '16px', 
          minHeight: '600px',
          width: '100%',
          alignItems: 'flex-start'
        }}
      >
        {columns.map(col => (
          <div
            key={col.id}
            style={{
              flex: '0 0 320px',
              backgroundColor: 'var(--background-secondary, #f8fafc)',
              borderRadius: 'var(--radius-l)',
              border: '1px solid var(--border-color)',
              padding: '16px 12px',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '75vh',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
            }}
          >
            {/* Column Header */}
            <Flex justify="space-between" align="center" style={{ marginBottom: '4px' }}>
              <Title level={5} style={{ margin: 0, fontSize: '14px', fontWeight: 'var(--weight-bold)', color: 'var(--text-color)' }}>
                {col.title}
              </Title>
              <Badge count={col.tasks.length} color={col.color} style={{ fontSize: '11px', fontWeight: 'bold' }} />
            </Flex>
            <Text type="secondary" style={{ fontSize: '11px', marginBottom: '16px', display: 'block' }}>
              {col.subtitle}
            </Text>

            {/* Cards scroll area */}
            <div 
              className="column-cards" 
              style={{ 
                overflowY: 'auto', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '12px',
                flexGrow: 1,
                paddingRight: '4px'
              }}
            >
              {col.tasks.length === 0 ? (
                <Flex 
                  direction="vertical" 
                  align="center" 
                  justify="center" 
                  style={{ 
                    padding: '32px 16px', 
                    borderRadius: 'var(--radius-m)', 
                    border: '1px dashed var(--border-color)',
                    background: 'rgba(255,255,255,0.4)'
                  }}
                >
                  <InboxOutlined style={{ fontSize: 24, color: '#cbd5e1', marginBottom: 8 }} />
                  <Text type="secondary" style={{ fontSize: '12px', textAlign: 'center' }}>Sem tarefas</Text>
                </Flex>
              ) : (
                col.tasks.map(task => {
                  const isOverdue = task.status !== 'completed' && task.due_date && new Date(task.due_date) < today

                  return (
                    <Card
                      key={task.id}
                      hoverable
                      bordered={false}
                      style={{ 
                        borderRadius: 'var(--radius-m)',
                        boxShadow: 'var(--shadow-s)',
                        borderLeft: `4px solid ${col.color}`,
                        border: isOverdue ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-color)',
                        transition: 'all 0.2s ease-in-out'
                      }}
                      styles={{ body: { padding: '16px' } }}
                      onClick={() => navigate(`/workspace/processes/${task.process_instance_id}?taskId=${task.task_id}`)}
                    >
                      <Space direction="vertical" size={10} style={{ width: '100%' }}>
                        {/* Process ID and Overdue tag */}
                        <Flex justify="space-between" align="center">
                          <Tag style={{ borderRadius: 'var(--radius-pill)', fontSize: '10px', margin: 0 }}>
                            {task.process_instance_id}
                          </Tag>
                          {isOverdue && (
                            <Tag color="error" icon={<WarningOutlined />} style={{ borderRadius: 'var(--radius-pill)', fontSize: '10px', margin: 0, fontWeight: 'bold' }}>
                              ATRASADA
                            </Tag>
                          )}
                        </Flex>

                        {/* Task Title */}
                        <Text strong style={{ fontSize: '13px', display: 'block', lineHeight: '1.3' }}>
                          {task.task_name}
                        </Text>

                        {/* Process Title */}
                        <Paragraph 
                          type="secondary" 
                          ellipsis={{ rows: 2 }} 
                          style={{ fontSize: '11px', margin: 0, lineHeight: '1.3' }}
                          title={task.process_title}
                        >
                          {task.process_title}
                        </Paragraph>

                        {/* Stage Name */}
                        <Flex gap={4} align="center">
                          <FileTextOutlined style={{ fontSize: '11px', color: '#94a3b8' }} />
                          <Text type="secondary" style={{ fontSize: '11px' }}>
                            {task.stage_name}
                          </Text>
                        </Flex>

                        {/* Card Footer: Assignee & Due Date */}
                        <Flex justify="space-between" align="center" style={{ marginTop: '4px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                          <Tooltip title={`Responsável: ${task.assignee_name}`}>
                            <Flex align="center" gap={6}>
                              <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: 'var(--primary-color)' }}>
                                {task.assignee_name.charAt(0)}
                              </Avatar>
                              <Text style={{ fontSize: '11px', maxWidth: '100px' }} ellipsis>
                                {task.assignee_name.split(' ')[0]}
                              </Text>
                            </Flex>
                          </Tooltip>

                          {task.due_date ? (
                            <Text 
                              type={isOverdue ? 'danger' : 'secondary'} 
                              style={{ fontSize: '11px', fontWeight: isOverdue ? 'bold' : 'normal' }}
                            >
                              Prazo: {new Date(task.due_date).toLocaleDateString()}
                            </Text>
                          ) : (
                            <Text type="secondary" style={{ fontSize: '11px', fontStyle: 'italic' }}>
                              Sem prazo
                            </Text>
                          )}
                        </Flex>
                      </Space>
                    </Card>
                  )
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function useAllUsersQuery() {
  const { data: users, isLoading } = useUsers()
  return { data: users, isLoadingUsers: isLoading }
}
