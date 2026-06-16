import { useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Flex, Spin, Empty, Button, Card, Typography, message } from 'antd'
import { LockOutlined } from '@ant-design/icons'
import { useProcesses } from '../hooks/useProcesses'
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
  const processes = useProcesses()
  const { processInstances, processSteps, processInstanceSteps, tasks, processInstanceTasks } = processes

  const [selectedStepId, setSelectedStepId] = useState(null)
  const [currentSlide, setCurrentSlide] = useState(0)

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

  const tasksForSelectedStep = useMemo(() =>
    selectedInstStep ? processInstanceTasks?.filter(
      pit => Number(pit.process_instance_id) === Number(instanceId) &&
        Number(pit.process_instance_step_id) === Number(selectedInstStep.id)
    ) : [],
    [selectedInstStep, processInstanceTasks, instanceId])

  const enrichedTasks = useMemo(() =>
    tasksForSelectedStep.map(pit => {
      const taskDef = tasks?.find(t => t.id === pit.task_id)
      return {
        ...pit,
        ...taskDef,
        id: pit.id,
        name: taskDef?.name || `Tarefa #${pit.task_id}`,
        type: taskDef?.type || 'unknown'
      }
    }),
    [tasksForSelectedStep, tasks])

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

  return {
    ...processes,
    instance,
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
    handleToggleTask
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
    handleToggleTask
  } = useMethodDetailsData(instanceId)

  const isLoading = isLoadingInstances || isLoadingSteps || isLoadingInstanceSteps || isLoadingTasks || isLoadingInstanceTasks

  if (isLoading) return <LoadingView />
  if (!instance) return <NotFoundView onBack={() => navigate('/workspace')} />

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <ProcessInstanceHeader
        instance={instance}
        overallProgress={overallProgress}
        onBack={() => navigate('/workspace')}
      />

      {isStepLocked ? (
        <LockedStepView />
      ) : enrichedTasks.length === 0 ? (
        <EmptyStepView isCompleted={selectedInstStep?.is_completed} />
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
    </div>
  )
}