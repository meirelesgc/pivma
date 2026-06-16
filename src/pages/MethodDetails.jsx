import { useState, useMemo, useCallback, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Flex, Spin, Empty, Button, Card, Typography, message, Radio, Select, Divider, Row, Col } from 'antd'
import { LockOutlined } from '@ant-design/icons'
import { useProcesses } from '../hooks/useProcesses'
import { useAuth } from '../hooks/useAuth'
import { ProcessInstanceHeader } from '../components/MethodDetails/ProcessInstanceHeader'
import { TaskCarousel } from '../components/MethodDetails/TaskCarousel'
import { TaskCard } from '../components/MethodDetails/TaskCard'

const { Title, Text } = Typography

const LoadingView = () => (
  <Flex justify="center" align="center" style={{ minHeight: '400px' }}>
    <Spin size="large" tip="Carregando detalhes do método..." />
  </Flex>
)

const NotFoundView = ({ onBack }) => (
  <div style={{ padding: '24px', textAlign: 'center' }}>
    <Empty description="Método não encontrado." />
    <Button type="primary" onClick={onBack} style={{ marginTop: '16px' }}>
      Voltar para Workspace
    </Button>
  </div>
)

const LockedStepView = () => (
  <Card style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0', padding: '24px' }}>
    <Flex vertical align="center" justify="center" style={{ padding: '48px 0', backgroundColor: '#fafafa', borderRadius: '12px' }}>
      <LockOutlined style={{ fontSize: '48px', color: '#bfbfbf', marginBottom: '16px' }} />
      <Title level={5} style={{ margin: 0, color: '#8c8c8c', fontFamily: 'Barlow, sans-serif' }}>Etapa Bloqueada</Title>
      <Text type="secondary" style={{ marginTop: '8px', fontFamily: 'Lexend, sans-serif' }}>
        Você precisa concluir a etapa anterior para liberar as tarefas desta etapa.
      </Text>
    </Flex>
  </Card>
)

const EmptyStepView = ({ isCompleted }) => (
  <Card style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0', padding: '24px' }}>
    <Empty
      description={
        isCompleted
          ? "Todas as tarefas desta etapa já foram concluídas!"
          : "Nenhuma tarefa disponível para esta etapa."
      }
      style={{ padding: '32px 0' }}
    />
  </Card>
)

const TaskContainer = ({ enrichedTasks, currentSlide, maxSlide, itemsPerPage, onNext, onPrev, onSetSlide, onToggleTask }) => {
  const selectedTask = enrichedTasks[currentSlide]

  return (
    <>
      <TaskCarousel
        enrichedTasks={enrichedTasks}
        currentSlide={currentSlide}
        maxSlide={maxSlide}
        itemsPerPage={itemsPerPage}
        onNext={onNext}
        onPrev={onPrev}
        onSetSlide={onSetSlide}
      />
      {selectedTask && (
        <div style={{ marginTop: '24px' }}>
          <TaskCard task={selectedTask} onToggle={() => onToggleTask(selectedTask.id, selectedTask.is_completed)} />
        </div>
      )}
    </>
  )
}

function useMethodDetailsData(instanceId) {
  const [searchParams] = useSearchParams()
  const queryStepId = searchParams.get('stepId') ? Number(searchParams.get('stepId')) : null
  const queryTaskId = searchParams.get('taskId') ? Number(searchParams.get('taskId')) : null

  const processes = useProcesses()
  const { user: currentUser } = useAuth()
  const { processInstances, processSteps, processInstanceSteps, tasks, processInstanceTasks, processInstanceRoles } = processes

  const [selectedStepId, setSelectedStepId] = useState(null)
  const [currentSlide, setCurrentSlide] = useState(0)

  // Sync step from query param if available
  useEffect(() => {
    if (queryStepId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedStepId(queryStepId)
    }
  }, [queryStepId])

  // Estados dos Filtros
  const [actorFilter, setActorFilter] = useState(false) // true = "Minhas Tarefas"
  const [statusFilter, setStatusFilter] = useState('all') // all, pending, pending_review, completed
  const [typeFilter, setTypeFilter] = useState('all') // all, form, assignment, approval, sample_definition, data_template_definition
  const [stepFilter, setStepFilter] = useState('current') // current, all

  const instance = useMemo(() =>
    processInstances?.find(inst => inst.id === instanceId),
    [processInstances, instanceId])

  const steps = useMemo(() =>
    processSteps?.filter(step => step?.process_id === instance?.process_id)
      .sort((a, b) => a.sequence - b.sequence) || [],
    [processSteps, instance])

  const instSteps = useMemo(() =>
    processInstanceSteps?.filter(s => s.process_instance_id === instanceId) || [],
    [processInstanceSteps, instanceId])

  const activeStep = useMemo(() =>
    steps.find((step, index) => {
      const instStep = instSteps.find(s => s.step_id === step.id)
      const isCompleted = instStep?.is_completed ?? false
      const isFirst = index === 0
      const prevCompleted = isFirst || (instSteps.find(s => s.step_id === steps[index - 1].id)?.is_completed ?? false)
      return !isCompleted && prevCompleted
    }),
    [steps, instSteps])

  const currentSelectedStepId = selectedStepId || activeStep?.id || steps[0]?.id
  const selectedInstStep = instSteps.find(s => s.step_id === currentSelectedStepId)

  // Obter cargos do usuário atual na instância
  const userRoles = useMemo(() =>
    processInstanceRoles
      .filter(r => r.instance_id === instanceId && r.user_id === currentUser?.id)
      .map(r => r.role.toLowerCase()),
    [processInstanceRoles, instanceId, currentUser])

  const tasksForSelectedStep = useMemo(() => {
    if (stepFilter === 'all') {
      return processInstanceTasks?.filter(
        pit => Number(pit.process_instance_id) === Number(instanceId)
      ) || []
    }
    return selectedInstStep ? processInstanceTasks?.filter(
      pit => Number(pit.process_instance_id) === Number(instanceId) &&
        Number(pit.process_instance_step_id) === Number(selectedInstStep.id)
    ) : []
  }, [selectedInstStep, processInstanceTasks, instanceId, stepFilter])

  // Lista Bruta de tarefas enriquecidas
  const allEnrichedTasks = useMemo(() =>
    tasksForSelectedStep.map(pit => {
      const taskDef = tasks?.find(t => t.id === pit.task_id)
      const stepInstance = processInstanceSteps?.find(s => s.id === pit.process_instance_step_id)
      const stepDef = steps?.find(s => s.id === stepInstance?.step_id)
      return {
        ...pit,
        ...taskDef,
        id: pit.id,
        name: taskDef?.name || `Tarefa #${pit.task_id}`,
        type: taskDef?.type || 'unknown',
        stepName: stepDef?.name || ''
      }
    }),
    [tasksForSelectedStep, tasks, processInstanceSteps, steps])

  // Lista Filtrada de tarefas
  const enrichedTasks = useMemo(() => {
    return allEnrichedTasks.filter(task => {
      // 1. Filtro: Minhas Tarefas (Apenas o que eu tenho que executar)
      if (actorFilter) {
        if (task.is_completed) return false

        const hasExecutorRole = task.role && userRoles.includes(task.role.toLowerCase())
        const hasCurrentRevisorRole = task.current_reviewer_role && userRoles.includes(task.current_reviewer_role.toLowerCase())
        const hasRequiredReviewerRole = task.required_reviewers && task.required_reviewers.some(r => userRoles.includes(r.toLowerCase()))

        if (!hasExecutorRole && !hasCurrentRevisorRole && !hasRequiredReviewerRole) {
          return false
        }
      }

      // 2. Filtro: Status
      if (statusFilter !== 'all') {
        if (statusFilter === 'completed') {
          if (!task.is_completed) return false
        } else if (statusFilter === 'pending_review') {
          if (task.status !== 'pending_review') return false
        } else if (statusFilter === 'pending') {
          // Pendente comum (não concluída e não em revisão)
          if (task.is_completed || task.status === 'pending_review') return false
        }
      }

      // 3. Filtro: Natureza (Tipo)
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
  }, [allEnrichedTasks, actorFilter, statusFilter, typeFilter, userRoles])

  // Reseta o slide para 0 ao alterar qualquer filtro
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentSlide(0)
  }, [actorFilter, statusFilter, typeFilter, stepFilter])

  // Sync task slide from query param if available
  useEffect(() => {
    if (queryTaskId && enrichedTasks.length > 0) {
      const idx = enrichedTasks.findIndex(t => t.id === queryTaskId)
      if (idx !== -1) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCurrentSlide(idx)
      }
    }
  }, [queryTaskId, enrichedTasks])

  const overallProgress = useMemo(() => {
    const completed = instSteps.filter(s => s.is_completed).length
    return steps.length > 0 ? Math.round((completed / steps.length) * 100) : 0
  }, [instSteps, steps])

  const isStepLocked = useMemo(() => {
    const currentStepDef = steps.find(s => s.id === currentSelectedStepId)
    const prevStep = currentStepDef && steps.find(s => s.sequence === currentStepDef.sequence - 1)
    const prevInstStep = prevStep && instSteps.find(s => s.step_id === prevStep.id)

    return selectedInstStep && !selectedInstStep.is_completed && currentStepDef?.sequence > 1 && !(prevInstStep?.is_completed ?? true)
  }, [steps, currentSelectedStepId, selectedInstStep, instSteps])

  const itemsPerPage = 3
  const maxSlide = Math.max(0, enrichedTasks.length - itemsPerPage)

  const handleNextSlide = () => setCurrentSlide(prev => Math.min(prev + 1, maxSlide))
  const handlePrevSlide = () => setCurrentSlide(prev => Math.max(prev - 1, 0))

  const handleToggleTask = useCallback((taskInstanceId, currentCompletedStatus) => {
    processes.updateProcessInstanceTask({
      taskInstanceId,
      isCompleted: !currentCompletedStatus
    }, {
      onSuccess: () => {
        message.success('Status da tarefa atualizado!')
        if (currentCompletedStatus) return

        const otherPendingTasks = tasksForSelectedStep.filter(t => t.id !== taskInstanceId && !t.is_completed)

        if (otherPendingTasks.length === 0) {
          const currentStepDef = steps.find(s => s.id === currentSelectedStepId)
          const nextStep = currentStepDef && steps.find(s => s.sequence === currentStepDef.sequence + 1)

          if (nextStep) {
            setSelectedStepId(nextStep.id)
            setCurrentSlide(0)
            message.success(`Etapa "${currentStepDef.name}" concluída! Avançando para "${nextStep.name}".`)
          }
        } else {
          const currentIndex = enrichedTasks.findIndex(t => t.id === taskInstanceId)
          if (currentIndex !== -1 && currentIndex < enrichedTasks.length - 1) {
            setCurrentSlide(currentIndex + 1)
          } else {
            const firstPendingIndex = enrichedTasks.findIndex(t => !t.is_completed && t.id !== taskInstanceId)
            if (firstPendingIndex !== -1) setCurrentSlide(firstPendingIndex)
          }
        }
      },
      onError: () => message.error('Erro ao atualizar status da tarefa.')
    })
  }, [processes, tasksForSelectedStep, enrichedTasks, steps, currentSelectedStepId])

  const handleResetFilters = () => {
    setActorFilter(false)
    setStatusFilter('all')
    setTypeFilter('all')
    setStepFilter('current')
  }

  const totalInstanceTasks = useMemo(() =>
    processInstanceTasks?.filter(pit => Number(pit.process_instance_id) === Number(instanceId)) || [],
    [processInstanceTasks, instanceId])

  return {
    ...processes,
    instance,
    allEnrichedTasks,
    enrichedTasks,
    overallProgress,
    isStepLocked,
    selectedInstStep,
    currentSlide,
    setCurrentSlide,
    maxSlide,
    itemsPerPage,
    handleNextSlide,
    handlePrevSlide,
    handleToggleTask,
    actorFilter,
    setActorFilter,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    stepFilter,
    setStepFilter,
    totalInstanceTasks,
    handleResetFilters
  }
}

export function MethodDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const instanceId = Number(id)

  const {
    isLoadingInstances,
    isLoadingSteps,
    isLoadingInstanceSteps,
    isLoadingTasks,
    isLoadingInstanceTasks,
    instance,
    allEnrichedTasks,
    enrichedTasks,
    overallProgress,
    isStepLocked,
    selectedInstStep,
    currentSlide,
    setCurrentSlide,
    maxSlide,
    itemsPerPage,
    handleNextSlide,
    handlePrevSlide,
    handleToggleTask,
    actorFilter,
    setActorFilter,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    stepFilter,
    setStepFilter,
    totalInstanceTasks,
    handleResetFilters
  } = useMethodDetailsData(instanceId)

  const isLoading = isLoadingInstances || isLoadingSteps || isLoadingInstanceSteps || isLoadingTasks || isLoadingInstanceTasks

  if (isLoading) return <LoadingView />
  if (!instance) return <NotFoundView onBack={() => navigate('/workspace')} />

  const hasActiveFilters = actorFilter || statusFilter !== 'all' || typeFilter !== 'all' || stepFilter !== 'current'

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <ProcessInstanceHeader
        instance={instance}
        overallProgress={overallProgress}
        onBack={() => navigate('/workspace')}
      />

      {isStepLocked ? (
        <LockedStepView />
      ) : (
        <>
          {/* Barra de Filtros */}
          {totalInstanceTasks.length > 0 && (
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
                          { value: 'current', label: 'Etapa Selecionada' },
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
          )}

          {allEnrichedTasks.length === 0 ? (
            <EmptyStepView isCompleted={selectedInstStep?.is_completed} />
          ) : enrichedTasks.length === 0 ? (
            <Card style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0', padding: '24px' }}>
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
            <TaskContainer
              enrichedTasks={enrichedTasks}
              currentSlide={currentSlide}
              maxSlide={maxSlide}
              itemsPerPage={itemsPerPage}
              onNext={handleNextSlide}
              onPrev={handlePrevSlide}
              onSetSlide={setCurrentSlide}
              onToggleTask={handleToggleTask}
            />
          )}
        </>
      )}
    </div>
  )
}