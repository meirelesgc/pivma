import { useTaskDetails, useTaskInstanceByProcessAndTask } from '../../hooks/useTasks'
import { Skeleton, Result } from 'antd'
import { ClockCircleOutlined } from '@ant-design/icons'
import { FormTask } from './FormTask'
import { UploadTask } from './UploadTask'
import { AIReviewTask } from './AIReviewTask'
import { FormSummaryTask } from './FormSummaryTask'
import { ApprovalTask } from './ApprovalTask'

export function TaskRenderer({ processId, taskId, currentStageId }) {
  const { data: task, isLoading: isLoadingTask, error: taskError } = useTaskDetails(taskId)

  const { data: taskInstance, isLoading: isLoadingInstance } = useTaskInstanceByProcessAndTask(processId, taskId)

  // Se estivermos na Etapa 2 (Planejamento) ou sem tarefa ativa, exibir mensagem de "Em desenvolvimento"
  if (currentStageId === 2 || !taskId) {
    return (
      <Result
        status="info"
        title="Etapa em Desenvolvimento"
        subTitle="Planejamento e Preparação - Em desenvolvimento"
      />
    )
  }


  if (isLoadingTask || isLoadingInstance) {
    return <Skeleton active paragraph={{ rows: 5 }} />
  }

  if (taskError || !task) {
    return (
      <Result
        status="warning"
        title="Erro ao carregar tarefa"
        subTitle="Não foi possível recuperar os detalhes da tarefa atual."
      />
    )
  }


  // Se não houver instância, significa que a tarefa ainda não foi iniciada ou não está disponível
  if (!taskInstance) {
    return (
      <Result
        icon={<ClockCircleOutlined style={{ color: 'var(--border-color)' }} />}
        title="Tarefa não disponível"
        subTitle="Esta tarefa ainda não foi inicializada no fluxo."
      />
    )
  }

  // Delegar renderização baseada no tipo
  switch (task.task_type) {
    case 'form':
      return <FormTask task={task} taskInstance={taskInstance} processId={processId} />
    case 'document_upload':
      return <UploadTask task={task} taskInstance={taskInstance} processId={processId} />
    case 'form_summary':
      return <FormSummaryTask task={task} taskInstance={taskInstance} processId={processId} />
    case 'ai_review':
      return <AIReviewTask task={task} taskInstance={taskInstance} processId={processId} />
    case 'approval':
      return <ApprovalTask task={task} taskInstance={taskInstance} processId={processId} />

    default:
      return (
        <Result
          status="info"
          title="Tipo de tarefa desconhecido"
          subTitle={`O tipo "${task.task_type}" não possui um renderizador configurado.`}
        />
      )
  }
}
