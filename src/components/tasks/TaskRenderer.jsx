import { useTaskDetails, useTaskInstanceByProcessAndTask } from '../../hooks/useTasks'
import { Skeleton, Result, Alert } from 'antd'
import { ClockCircleOutlined } from '@ant-design/icons'
import { FormTask } from './FormTask'
import { UploadTask } from './UploadTask'
import { AIReviewTask } from './AIReviewTask'
import { FormSummaryTask } from './FormSummaryTask'
import { ApprovalTask } from './ApprovalTask'
import processRoles from '../../data/mock/process_roles.json'

export function TaskRenderer({ processId, taskId, currentStageId, myRoleId, myRoleName }) {
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

  const canEdit = task?.editor_roles ? task.editor_roles.includes(myRoleId) : true
  const showReadOnlyAlert = (taskInstance.status === 'pending' || taskInstance.status === 'in_progress') && !canEdit

  const getEditorRolesNames = () => {
    if (!task?.editor_roles) return ''
    return task.editor_roles
      .map(rId => {
        const found = processRoles.find(pr => pr.id === rId)
        return found ? found.name : ''
      })
      .filter(Boolean)
      .join(', ')
  }

  const renderContent = () => {
    switch (task.task_type) {
      case 'form':
        return <FormTask task={task} taskInstance={taskInstance} processId={processId} canEdit={canEdit} />
      case 'document_upload':
        return <UploadTask task={task} taskInstance={taskInstance} processId={processId} canEdit={canEdit} />
      case 'form_summary':
        return <FormSummaryTask task={task} taskInstance={taskInstance} processId={processId} canEdit={canEdit} />
      case 'ai_review':
        return <AIReviewTask task={task} taskInstance={taskInstance} processId={processId} canEdit={canEdit} />
      case 'approval':
        return <ApprovalTask task={task} taskInstance={taskInstance} processId={processId} canEdit={canEdit} myRoleId={myRoleId} myRoleName={myRoleName} />

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {showReadOnlyAlert && (
        <Alert
          message="Modo de Visualização"
          description={`Você está visualizando esta tarefa porque seu cargo é "${myRoleName}". Apenas usuários com o cargo "${getEditorRolesNames()}" podem interagir.`}
          type="info"
          showIcon
          style={{ borderRadius: 'var(--radius-m)' }}
        />
      )}
      {renderContent()}
    </div>
  )
}
