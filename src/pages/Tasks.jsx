import { useState, useMemo } from 'react'
import {
  Typography,
  Card,
  Tag,
  Button,
  Empty,
  Flex,
  Badge,
  Space,
  Select,
  Divider,
  Switch
} from 'antd'
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  SlidersOutlined,
  InfoCircleOutlined,
  CalendarOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useProcesses } from '../hooks/useProcesses'
import { useAuth } from '../hooks/useAuth'
import { getAuditLogs } from '../services/processes'

const { Title, Text } = Typography

export function TasksPage() {
  const { user } = useAuth()
  const isAdmin = user?.system_role === 'admin'
  const navigate = useNavigate()

  // --- HOOKS DATA ---
  const {
    availableProcesses,
    processInstances,
    processInstanceSteps,
    processInstanceTasks,
    tasks: taskDefinitions,
    processSteps,
    processInstanceRoles,
    isLoadingAvailable,
    isLoadingInstances,
    isLoadingInstanceSteps,
    isLoadingInstanceTasks,
    isLoadingSteps
  } = useProcesses()

  const { data: allAuditLogs = [], isLoading: isLoadingLogs } = useQuery({
    queryKey: ['allAuditLogs'],
    queryFn: getAuditLogs
  })

  // --- FILTERS STATE ---
  const [processFilter, setProcessFilter] = useState('all')
  const [stepFilter, setStepFilter] = useState('all')
  const [stateFilter, setStateFilter] = useState('all')
  const [inactivityDays, setInactivityDays] = useState(7)
  const [onlyMyPending, setOnlyMyPending] = useState(false)

  const handleResetFilters = () => {
    setProcessFilter('all')
    setStepFilter('all')
    setStateFilter('all')
    setInactivityDays(7)
    setOnlyMyPending(false)
  }

  const hasActiveFilters = processFilter !== 'all' || stepFilter !== 'all' || stateFilter !== 'all' || onlyMyPending || inactivityDays !== 7

  // Step Options for Filter
  const stepOptions = useMemo(() => {
    const names = Array.from(new Set(processSteps.map(s => s.name)))
    return [
      { value: 'all', label: 'Todas as Etapas' },
      ...names.map(name => ({ value: name, label: name }))
    ]
  }, [processSteps])

  // --- VISIBILITY & ROLES MAP ---
  const userRolesMap = useMemo(() => {
    if (!user) return {}
    const map = {}
    processInstanceRoles.forEach(r => {
      if (r.user_id === user.id) {
        if (!map[r.instance_id]) map[r.instance_id] = []
        map[r.instance_id].push(r.role.toLowerCase())
      }
    })
    return map
  }, [processInstanceRoles, user])

  const visibleInstances = useMemo(() => {
    if (isAdmin) return processInstances
    return processInstances.filter(inst => {
      const roles = userRolesMap[inst.id] || []
      return roles.length > 0
    })
  }, [processInstances, isAdmin, userRolesMap])

  // Opções de Instâncias Ativas (Processos) para o Filtro
  const processOptions = useMemo(() => {
    return [
      { value: 'all', label: 'Todos os Processos' },
      ...visibleInstances.map(inst => {
        const template = availableProcesses.find(p => p.id === inst.process_id)
        const name = template ? template.name : 'Processo Desconhecido'
        const label = `BRA-2026-${String(inst.id).padStart(3, '0')} - ${name}`
        return { value: String(inst.id), label }
      })
    ]
  }, [visibleInstances, availableProcesses])

  // --- PROCESS KANBAN CALCULATION ---
  const kanbanProcesses = useMemo(() => {
    if (!visibleInstances.length) return []
    return visibleInstances.map(instance => {
      const processTemplate = availableProcesses.find(p => p.id === instance.process_id)
      const processName = processTemplate ? processTemplate.name : 'Processo Desconhecido'

      const steps = processSteps
        .filter(s => s.process_id === instance.process_id)
        .sort((a, b) => a.sequence - b.sequence)

      const instSteps = processInstanceSteps.filter(is => is.process_instance_id === instance.id)

      const activeStep = steps.find(s => {
        const instS = instSteps.find(is => is.step_id === s.id)
        return !instS || !instS.is_completed
      })

      const isCompleted = steps.length > 0 && steps.every(s => {
        const instS = instSteps.find(is => is.step_id === s.id)
        return instS && instS.is_completed
      })

      const activeStepInstance = activeStep ? instSteps.find(is => is.step_id === activeStep.id) : null

      const pendingTasks = activeStepInstance
        ? processInstanceTasks.filter(pit => pit.process_instance_step_id === activeStepInstance.id && !pit.is_completed)
        : []

      const responsibleRoles = Array.from(new Set(
        pendingTasks.map(pit => {
          const taskDef = taskDefinitions.find(t => t.id === pit.task_id)
          if (!taskDef) return null

          if (pit.status === 'pending_review' || pit.status === 'analyzing_ai') {
            return pit.current_reviewer_role || (taskDef.required_reviewers && taskDef.required_reviewers[0]) || 'Revisor'
          }
          return taskDef.role
        }).filter(Boolean)
      ))

      const instanceLogs = allAuditLogs
        .filter(log => log.process_instance_id === instance.id)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

      const lastLog = instanceLogs[0]
      const lastActivityTimestamp = lastLog ? lastLog.timestamp : instance.createdAt
      const lastAction = lastLog ? lastLog.action : 'Método Criado'
      const lastDescription = lastLog ? lastLog.description : 'Instância do método de validação criada.'

      const daysSinceLastActivity = Math.floor(
        (new Date() - new Date(lastActivityTimestamp)) / (1000 * 60 * 60 * 24)
      )

      const instanceTasks = processInstanceTasks.filter(pit => pit.process_instance_id === instance.id)
      const completedTasksCount = instanceTasks.filter(t => t.is_completed).length

      let column = 'in_progress'
      if (isCompleted) {
        column = 'completed'
      } else if (completedTasksCount === 0) {
        column = 'not_started'
      } else if (daysSinceLastActivity > inactivityDays) {
        column = 'delayed'
      }

      // Verifica se o usuário logado possui ação/responsabilidade na etapa corrente
      const userRolesForInstance = userRolesMap[instance.id] || []
      const requiresMyAction = responsibleRoles.some(role => userRolesForInstance.includes(role.toLowerCase()))

      return {
        ...instance,
        processName,
        activeStepName: isCompleted ? 'Concluído' : (activeStep ? activeStep.name : 'Nenhuma'),
        activeStepSequence: activeStep ? activeStep.sequence : 4,
        responsibleRoles,
        lastActivityTimestamp,
        lastAction,
        lastDescription,
        daysSinceLastActivity,
        column,
        requiresMyAction,
        formattedId: `BRA-2026-${String(instance.id).padStart(3, '0')}`
      }
    })
  }, [visibleInstances, availableProcesses, processSteps, processInstanceSteps, processInstanceTasks, taskDefinitions, allAuditLogs, inactivityDays, userRolesMap])

  // --- FILTERED KANBAN PROCESSES ---
  const filteredProcesses = useMemo(() => {
    return kanbanProcesses.filter(p => {
      // 1. Filtro de Instância de Processo (Método)
      if (processFilter !== 'all' && p.id !== Number(processFilter)) {
        return false
      }
      // 2. Filtro de Etapa
      if (stepFilter !== 'all' && p.activeStepName !== stepFilter) {
        return false
      }
      // 3. Filtro de Estado/Coluna
      if (stateFilter !== 'all' && p.column !== stateFilter) {
        return false
      }
      // 4. Filtro de Minhas Pendências
      if (onlyMyPending && !p.requiresMyAction) {
        return false
      }
      return true
    })
  }, [kanbanProcesses, processFilter, stepFilter, stateFilter, onlyMyPending])

  // Divisão em Colunas
  const colNotStarted = filteredProcesses.filter(p => p.column === 'not_started')
  const colInProgress = filteredProcesses.filter(p => p.column === 'in_progress')
  const colDelayed = filteredProcesses.filter(p => p.column === 'delayed')
  const colCompleted = filteredProcesses.filter(p => p.column === 'completed')

  // --- STATS / METRICS ---
  const _activeCount = kanbanProcesses.filter(p => p.column !== 'completed').length
  const _completedCount = kanbanProcesses.filter(p => p.column === 'completed').length
  const _myPendingCount = kanbanProcesses.filter(p => p.requiresMyAction && p.column !== 'completed').length
  const _delayedCount = kanbanProcesses.filter(p => p.column === 'delayed').length

  // --- CARD & COLUMN RENDERERS ---
  const renderKanbanCard = (p) => {
    const isDelayed = p.column === 'delayed'
    const daysText = p.daysSinceLastActivity === 0 ? 'Hoje' : (p.daysSinceLastActivity === 1 ? 'Ontem' : `Há ${p.daysSinceLastActivity} dias`)

    return (
      <Card
        key={p.id}
        hoverable
        onClick={() => navigate(`/workspace/method/${p.id}`)}
        style={{
          borderRadius: '12px',
          border: isDelayed ? '1.5px solid #ffccc7' : '1px solid #e8e8e8',
          boxShadow: isDelayed ? '0 6px 16px rgba(255, 77, 79, 0.06)' : '0 4px 12px rgba(0,0,0,0.01)',
          marginBottom: '12px',
          transition: 'all 0.2s ease',
          backgroundColor: '#fff'
        }}
        bodyStyle={{ padding: '16px' }}
      >
        <Flex vertical gap={10}>
          <Flex justify="space-between" align="center">
            <Tag color="blue" style={{ borderRadius: '4px', fontWeight: '600', fontSize: '11px', margin: 0 }}>
              {p.formattedId}
            </Tag>
            {p.requiresMyAction && (
              <Tag color="red" style={{ borderRadius: '4px', fontWeight: '700', fontSize: '10px', margin: 0 }}>
                MINHA AÇÃO
              </Tag>
            )}
            {isDelayed && !p.requiresMyAction && (
              <Tag color="orange" style={{ borderRadius: '4px', fontWeight: '600', fontSize: '10px', margin: 0 }}>
                SEM ATIVIDADE
              </Tag>
            )}
          </Flex>

          <Title level={5} style={{ margin: 0, fontSize: '14px', color: '#262626', fontFamily: 'Barlow, sans-serif', fontWeight: '700', lineHeight: '1.3' }}>
            {p.processName}
          </Title>

          <Flex vertical gap={4} style={{ backgroundColor: '#fafafa', padding: '10px', borderRadius: '6px', border: '1px solid #f0f0f0' }}>
            <Flex justify="space-between">
              <Text type="secondary" style={{ fontSize: '12px' }}>Etapa Atual:</Text>
              <Text strong style={{ fontSize: '12px', color: '#434343' }}>{p.activeStepName}</Text>
            </Flex>
            <Flex justify="space-between">
              <Text type="secondary" style={{ fontSize: '12px' }}>Ação Pendente:</Text>
              <Text style={{ fontSize: '12px', color: '#1677ff', fontWeight: '600' }}>
                {p.responsibleRoles.length > 0 ? p.responsibleRoles.join(', ') : 'Ninguém (Concluído)'}
              </Text>
            </Flex>
          </Flex>

          <Divider style={{ margin: '8px 0' }} />

          <Flex vertical gap={2}>
            <Flex align="center" gap={4}>
              <CalendarOutlined style={{ color: '#8c8c8c', fontSize: '12px' }} />
              <Text type="secondary" style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                Última Ação ({daysText}):
              </Text>
            </Flex>
            <Text style={{ fontSize: '12px', color: '#7f7f7f', fontStyle: 'italic' }} ellipsis={{ tooltip: p.lastDescription }}>
              <strong>{p.lastAction}</strong>: {p.lastDescription}
            </Text>
          </Flex>
        </Flex>
      </Card>
    )
  }

  const renderKanbanColumn = (title, icon, list, colKey, bgColor, borderCol, accentColor) => {
    const isCollapsed = list.length === 0

    if (isCollapsed) {
      return (
        <div key={colKey} style={{ transition: 'all 0.3s ease', width: '60px', flex: '0 0 60px' }}>
          <div style={{
            backgroundColor: '#fafafa',
            border: '1px dashed #d9d9d9',
            borderRadius: '12px',
            padding: '20px 8px',
            height: '100%',
            minHeight: '450px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: '12px'
          }}>
            <Badge count={0} showZero style={{ backgroundColor: '#bfbfbf' }} />
            <div style={{
              writingMode: 'vertical-rl',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: '700',
              fontSize: '11px',
              color: '#8c8c8c',
              fontFamily: 'Barlow, sans-serif',
              transform: 'rotate(180deg)',
              whiteSpace: 'nowrap'
            }}>
              {title}
            </div>
          </div>
        </div>
      )
    }

    return (
      <div key={colKey} style={{ flex: 1, minWidth: '260px', transition: 'all 0.3s ease' }}>
        <div style={{
          backgroundColor: bgColor,
          border: `1px solid ${borderCol}`,
          borderRadius: '12px',
          padding: '16px 12px',
          height: '100%',
          minHeight: '450px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Flex align="center" justify="space-between" style={{ marginBottom: '16px', padding: '0 4px' }}>
            <Space size={8}>
              {icon}
              <Text strong style={{
                fontSize: '13px',
                fontFamily: 'Barlow, sans-serif',
                color: '#434343',
                textTransform: 'uppercase',
                letterSpacing: '0.03em'
              }}>
                {title}
              </Text>
            </Space>
            <Badge count={list.length} style={{ backgroundColor: accentColor }} />
          </Flex>

          <div style={{ flex: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 350px)', paddingRight: '4px' }}>
            {list.map(p => renderKanbanCard(p))}
          </div>
        </div>
      </div>
    )
  }

  // --- LOADING STATE ---
  const isLoading = isLoadingAvailable || isLoadingInstances || isLoadingInstanceSteps || isLoadingInstanceTasks || isLoadingSteps || isLoadingLogs

  return (
    <Flex vertical gap={24} style={{ padding: '24px' }}>
      <Flex vertical gap={8}>
        <Title level={2} style={{ margin: 0, fontFamily: 'Lexend, sans-serif' }}>Kanban</Title>
        <Text type="secondary">Visualização integrada dos métodos em validação no estudo</Text>
      </Flex>

      {isLoading ? (
        <Card loading style={{ borderRadius: '12px' }} />
      ) : (
        <>
          <Card
            style={{
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
              border: '1px solid #f0f0f0',
              background: '#fafafa'
            }}
            bodyStyle={{ padding: '16px 24px' }}
          >
            <Flex wrap="wrap" justify="space-between" align="center" gap={16}>
              <Flex gap={8} wrap="wrap" align="center">
                <Flex align="center" gap={4}>
                  <span style={{ fontFamily: 'Lexend, sans-serif', color: '#595959', fontSize: '13px', fontWeight: '500' }}>Processo:</span>
                  <Select
                    value={processFilter}
                    onChange={setProcessFilter}
                    style={{ width: 160, fontFamily: 'Lexend, sans-serif' }}
                    options={processOptions}
                  />
                </Flex>

                <Divider type="vertical" style={{ height: '24px', margin: 0 }} />

                <Flex align="center" gap={4}>
                  <span style={{ fontFamily: 'Lexend, sans-serif', color: '#595959', fontSize: '13px', fontWeight: '500' }}>Etapa Atual:</span>
                  <Select
                    value={stepFilter}
                    onChange={setStepFilter}
                    style={{ width: 160, fontFamily: 'Lexend, sans-serif' }}
                    options={stepOptions}
                  />
                </Flex>

                <Divider type="vertical" style={{ height: '24px', margin: 0 }} />

                <Flex align="center" gap={4}>
                  <span style={{ fontFamily: 'Lexend, sans-serif', color: '#595959', fontSize: '13px', fontWeight: '500' }}>Inatividade:</span>
                  <Select
                    value={inactivityDays}
                    onChange={setInactivityDays}
                    style={{ width: 100, fontFamily: 'Lexend, sans-serif' }}
                    options={[
                      { value: 3, label: '3 dias' },
                      { value: 5, label: '5 dias' },
                      { value: 7, label: '7 dias' },
                      { value: 10, label: '10 dias' },
                      { value: 15, label: '15 dias' }
                    ]}
                  />
                </Flex>

                <Divider type="vertical" style={{ height: '24px', margin: 0 }} />

                <Flex align="center" gap={8}>
                  <span style={{ fontFamily: 'Lexend, sans-serif', color: '#595959', fontSize: '13px', fontWeight: '500' }}>Minhas Pendências:</span>
                  <Switch
                    checked={onlyMyPending}
                    onChange={setOnlyMyPending}
                  />
                </Flex>
              </Flex>

              {hasActiveFilters && (
                <Button
                  type="link"
                  onClick={handleResetFilters}
                  style={{ fontFamily: 'Lexend, sans-serif', color: '#ff4d4f', padding: 0 }}
                >
                  Limpar Filtros
                </Button>
              )}
            </Flex>
          </Card>

          {filteredProcesses.length === 0 ? (
            <Card style={{ borderRadius: '12px', padding: '48px 0', border: '1.5px solid #f0f0f0' }}>
              <Empty description="Nenhum método ou processo corresponde aos filtros ativos." style={{ padding: '32px 0' }}>
                <Button type="primary" onClick={handleResetFilters} style={{ fontFamily: 'Lexend, sans-serif', borderRadius: '8px' }}>
                  Limpar Filtros
                </Button>
              </Empty>
            </Card>
          ) : (
            <Flex gap={12} style={{ flexFlow: 'row nowrap', overflowX: 'auto', paddingBottom: '8px' }}>
              {renderKanbanColumn('Não Iniciado', <InfoCircleOutlined style={{ color: '#8c8c8c' }} />, colNotStarted, 'not_started', '#ffffff', '#e8e8e8', '#8c8c8c')}
              {renderKanbanColumn('Em Andamento', <SlidersOutlined style={{ color: '#1890ff' }} />, colInProgress, 'in_progress', '#e6f7ff', '#bae7ff', '#1890ff')}
              {renderKanbanColumn('Em Atraso', <ClockCircleOutlined style={{ color: '#fa8c16' }} />, colDelayed, 'delayed', '#fffbe6', '#ffe58f', '#fa8c16')}
              {renderKanbanColumn('Concluído', <CheckCircleOutlined style={{ color: '#52c41a' }} />, colCompleted, 'completed', '#f6ffed', '#b7eb8f', '#52c41a')}
            </Flex>
          )}
        </>
      )}
    </Flex>
  )
}