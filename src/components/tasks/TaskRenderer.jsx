import React from 'react'
import { 
  useTaskDetails, 
  useTaskInstanceByProcessAndTask,
  useApproveTask,
  useRejectTask,
  useComments
} from '../../hooks/useTasks'
import { useAuth } from '../../hooks/useAuth'
import { 
  Skeleton, 
  Result, 
  Alert, 
  Card, 
  Button, 
  Input, 
  Space, 
  Typography, 
  message, 
  Flex 
} from 'antd'
import { 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  ExclamationCircleOutlined 
} from '@ant-design/icons'
import { FormTask } from './FormTask'
import { UploadTask } from './UploadTask'
import { AIReviewTask } from './AIReviewTask'
import { FormSummaryTask } from './FormSummaryTask'
import { ApprovalTask } from './ApprovalTask'
import { ParticipantAssignmentTask } from './ParticipantAssignmentTask'
import { AcknowledgementTask } from './AcknowledgementTask'
import { DocumentDownloadTask } from './DocumentDownloadTask'
import { DatasetSubmissionTask } from './DatasetSubmissionTask'
import processRoles from '../../data/mock/process_roles.json'

const { Title, Paragraph, Text } = Typography
const { TextArea } = Input

export function TaskRenderer({ processId, taskId, currentStageId, myRoleId, myRoleName }) {
  const { user: currentUser } = useAuth()
  const { data: task, isLoading: isLoadingTask, error: taskError } = useTaskDetails(taskId)
  const { data: taskInstance, isLoading: isLoadingInstance } = useTaskInstanceByProcessAndTask(processId, taskId)
  const { data: comments, isLoading: isLoadingComments } = useComments(taskInstance?.id)

  const approveTaskMutation = useApproveTask()
  const rejectTaskMutation = useRejectTask()

  const [rejecting, setRejecting] = React.useState(false)
  const [reason, setReason] = React.useState('')

  // Se não houver tarefa ativa
  if (!taskId) {
    return (
      <Result
        status="info"
        title="Nenhuma tarefa selecionada"
        subTitle="Selecione uma tarefa acima para iniciar."
      />
    )
  }

  const isLoading = isLoadingTask || isLoadingInstance || isLoadingComments

  if (isLoading) {
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

  const isEditor = task?.editor_roles ? task.editor_roles.includes(myRoleId) : true
  const isAwaitingApproval = taskInstance.status === 'awaiting_approval'
  const isCompleted = taskInstance.status === 'completed'
  const isRejected = taskInstance.status === 'rejected'

  // Só pode editar se for editor, e a tarefa não estiver concluída ou aguardando aprovação
  const canEdit = isEditor && !isAwaitingApproval && !isCompleted

  const isApprover = task.approver_roles?.includes(myRoleId) || myRoleId === 4

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

  const handleApprove = async () => {
    try {
      await approveTaskMutation.mutateAsync({
        taskInstanceId: taskInstance.id,
        userId: currentUser.id
      })
      message.success('Tarefa aprovada com sucesso!')
    } catch (err) {
      message.error('Erro ao aprovar tarefa: ' + err.message)
    }
  }

  const handleReject = async () => {
    if (!reason.trim()) {
      message.warning('Por favor, informe a justificativa da recusa.')
      return
    }
    try {
      await rejectTaskMutation.mutateAsync({
        taskInstanceId: taskInstance.id,
        userId: currentUser.id,
        commentText: reason
      })
      message.success('Tarefa devolvida para ajustes.')
      setRejecting(false)
      setReason('')
    } catch (err) {
      message.error('Erro ao rejeitar tarefa: ' + err.message)
    }
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
      case 'participant_assignment':
        return <ParticipantAssignmentTask task={task} taskInstance={taskInstance} processId={processId} canEdit={canEdit} myRoleId={myRoleId} myRoleName={myRoleName} />
      case 'acknowledgement':
        return <AcknowledgementTask task={task} taskInstance={taskInstance} processId={processId} canEdit={canEdit} />
      case 'document_download':
        return <DocumentDownloadTask task={task} taskInstance={taskInstance} processId={processId} canEdit={canEdit} />
      case 'dataset_submission':
        return <DatasetSubmissionTask task={task} taskInstance={taskInstance} processId={processId} canEdit={canEdit} />
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

  // Filtrar comentários de justificativa de rejeição recentes
  const rejectionComments = comments?.filter(c => c.content.startsWith('Justificativa de rejeição:')) || []
  const latestRejectionComment = rejectionComments[rejectionComments.length - 1]

  const isMutating = approveTaskMutation.isPending || rejectTaskMutation.isPending

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* Alerta de Modo de Visualização */}
      {showReadOnlyAlert && (
        <Alert
          message="Modo de Visualização"
          description={`Você está visualizando esta tarefa porque seu cargo é "${myRoleName}". Apenas usuários com o cargo "${getEditorRolesNames()}" podem interagir.`}
          type="info"
          showIcon
          style={{ borderRadius: 'var(--radius-m)' }}
        />
      )}

      {/* Alerta de Aguardando Aprovação (genérico para tarefas do tipo form/upload) */}
      {isAwaitingApproval && task.task_type !== 'participant_assignment' && (
        <Alert
          message="Aguardando Aprovação"
          description={
            isApprover
              ? "Esta tarefa foi submetida e aguarda sua revisão e aprovação técnica."
              : "Os dados foram enviados com sucesso e estão sob revisão do Coordenador do Grupo Gestor."
          }
          type="info"
          showIcon
          icon={<ClockCircleOutlined />}
          style={{ borderRadius: 'var(--radius-m)' }}
        />
      )}

      {/* Alerta de Rejeitado (genérico para tarefas do tipo form/upload) */}
      {isRejected && task.task_type !== 'participant_assignment' && (
        <Alert
          message="Ajustes Solicitados pelo Aprovador"
          description={
            <div>
              <Text>Esta tarefa foi devolvida para correções. Faça os ajustes necessários abaixo e reenvie.</Text>
              {latestRejectionComment && (
                <div style={{ marginTop: '8px', padding: '8px 12px', background: 'rgba(255, 255, 255, 0.4)', borderRadius: '6px', borderLeft: '3px solid #ff4d4f' }}>
                  <Text strong>Motivo da recusa:</Text>
                  <Paragraph style={{ margin: 0, fontStyle: 'italic' }}>
                    {latestRejectionComment.content.replace('Justificativa de rejeição: ', '')}
                  </Paragraph>
                </div>
              )}
            </div>
          }
          type="error"
          showIcon
          icon={<ExclamationCircleOutlined />}
          style={{ borderRadius: 'var(--radius-m)' }}
        />
      )}

      {/* Painel de Ações de Aprovação do Aprovador (apenas se status for awaiting_approval e a tarefa não for participant_assignment, que já tem tratamento interno) */}
      {isAwaitingApproval && isApprover && task.task_type !== 'participant_assignment' && task.task_type !== 'approval' && (
        <Card 
          bordered 
          style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-l)' }}
          title={<Text strong>Painel de Revisão (Coordenador)</Text>}
        >
          {!rejecting ? (
            <Flex justify="space-between" align="center">
              <Text type="secondary">Revise as informações preenchidas pelo editor abaixo:</Text>
              <Space>
                <Button 
                  danger 
                  icon={<CloseCircleOutlined />}
                  onClick={() => setRejecting(true)}
                  disabled={isMutating}
                >
                  Recusar / Solicitar Ajustes
                </Button>
                <Button 
                  type="primary" 
                  icon={<CheckCircleOutlined />}
                  onClick={handleApprove}
                  loading={isMutating}
                >
                  Aprovar e Avançar
                </Button>
              </Space>
            </Flex>
          ) : (
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <Text strong>Justificativa de Recusa:</Text>
              <TextArea 
                rows={3} 
                placeholder="Descreva detalhadamente o que precisa ser corrigido..." 
                value={reason}
                onChange={e => setReason(e.target.value)}
              />
              <Flex justify="flex-end" gap={8}>
                <Button onClick={() => { setRejecting(false); setReason(''); }}>Cancelar</Button>
                <Button type="primary" danger onClick={handleReject} loading={isMutating}>Confirmar Recusa</Button>
              </Flex>
            </Space>
          )}
        </Card>
      )}

      {/* Renderização do Componente Interno da Tarefa */}
      {renderContent()}
    </div>
  )
}
