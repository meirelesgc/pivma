import { useState, useEffect } from 'react'
import { Spin, Flex, message, Alert } from 'antd'
import { useFormTask, useProcesses } from '../../../hooks/useProcesses'
import { useAuth } from '../../../hooks/useAuth'
import { FormRenderer } from './FormRenderer'
import { ReviewActionToolbar } from './ReviewActionToolbar'

export function FormTask({ task, onToggle }) {
  const { user: currentUser } = useAuth()
  const {
    processInstanceRoles = [],
    fieldReviews = [],
    createFieldReview,
    submitFormTask,
    runAIEvaluation,
    acceptReview,
    rejectReview
  } = useProcesses()

  const { fields, isLoadingFields, answers, isLoadingAnswers, saveAnswers } = useFormTask(task.task_id, task.id)
  const [localAnswers, setLocalAnswers] = useState(null)
  const [isActionPending, setIsActionPending] = useState(false)

  const currentAnswers = localAnswers || answers || {}

  // Determine user role in this process instance
  const userRoleObj = processInstanceRoles.find(
    r => r.instance_id === task.process_instance_id && r.user_id === currentUser?.id
  )
  const userRole = userRoleObj ? userRoleObj.role.toLowerCase() : 'view'

  // Determine if we are in Revisor, Proponente or View mode
  const isCurrentRevisor = task.status === 'pending_review' &&
    task.current_reviewer_role &&
    userRole === task.current_reviewer_role.toLowerCase()

  const roleMode = isCurrentRevisor
    ? 'revisor'
    : (userRole === 'proponente' ? 'proponente' : 'view')

  // Filter reviews for this process instance
  const instanceReviews = fieldReviews.filter(r => r.process_instance_id === task.process_instance_id)
  const activeReviews = instanceReviews.filter(r => r.status === 'active')
  const allReviews = instanceReviews // historical review records

  // Effect to automatically run IA evaluation after a delay when task status is 'analyzing_ai'
  useEffect(() => {
    if (task.status === 'analyzing_ai') {
      const timer = setTimeout(() => {
        runAIEvaluation(task.id, {
          onSuccess: (updatedTask) => {
            if (updatedTask && updatedTask.status === 'pending_submission') {
              message.warning('A IA encontrou inconsistências nos dados! O formulário foi devolvido para correção.')
            } else {
              message.success('Análise de IA concluída! O formulário foi encaminhado para revisão.')
            }
          },
          onError: () => {
            message.error('Erro ao executar a validação de IA.')
          }
        })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [task.status, task.id, runAIEvaluation])

  const handleFieldChange = (fieldId, value) => {
    const updated = { ...currentAnswers, [fieldId]: value }
    setLocalAnswers(updated)
    saveAnswers({ instanceTaskId: task.id, answers: updated })
  }

  const handleSubmit = () => {
    setIsActionPending(true)
    submitFormTask(
      { instanceTaskId: task.id, answers: currentAnswers },
      {
        onSuccess: () => {
          message.loading('Iniciando análise de Inteligência Artificial...', 2.5)
          setIsActionPending(false)
        },
        onError: () => {
          message.error('Erro ao enviar o formulário.')
          setIsActionPending(false)
        }
      }
    )
  }

  const handleAddReviewComment = (fieldId, commentText) => {
    createFieldReview({
      process_instance_id: task.process_instance_id,
      review_round_id: task.current_review_round_id || 1,
      field_id: fieldId,
      reviewer_role: task.current_reviewer_role,
      comment: commentText,
      status: 'active'
    }, {
      onSuccess: () => {
        message.success('Apontamento registrado com sucesso!')
      },
      onError: () => {
        message.error('Erro ao registrar apontamento.')
      }
    })
  }

  const handleAcceptReview = () => {
    setIsActionPending(true)
    acceptReview(task.id, {
      onSuccess: (updatedTask) => {
        setIsActionPending(false)
        if (updatedTask.status === 'completed') {
          message.success('Revisão final aprovada! O formulário foi concluído.')
          onToggle() // notifies method details that the task has been completed
        } else {
          message.success(`Revisão aprovada! Encaminhado para o próximo revisor: ${updatedTask.current_reviewer_role.toUpperCase()}.`)
        }
      },
      onError: () => {
        message.error('Erro ao registrar aprovação.')
        setIsActionPending(false)
      }
    })
  }

  const handleRejectReview = () => {
    setIsActionPending(true)
    rejectReview(task.id, {
      onSuccess: () => {
        message.warning('Revisão recusada. O formulário foi devolvido ao proponente para correções.')
        setIsActionPending(false)
      },
      onError: () => {
        message.error('Erro ao registrar recusa.')
        setIsActionPending(false)
      }
    })
  }

  if (isLoadingFields || isLoadingAnswers) {
    return (
      <Flex justify="center" align="center" style={{ padding: '20px' }}>
        <Spin tip="Carregando formulário..." />
      </Flex>
    )
  }

  if (task.status === 'analyzing_ai') {
    return (
      <Flex vertical align="center" justify="center" style={{ padding: '40px', background: '#fafafa', borderRadius: '12px' }}>
        <Spin size="large" tip="Analisando dados do formulário com Inteligência Artificial..." />
        <div style={{ marginTop: '16px', color: '#8c8c8c' }}>Estratégias de validação regulatória em execução...</div>
      </Flex>
    )
  }

  // Disable edits if not editable, completed or under review
  const disabled = !task.editable || task.is_completed || isActionPending

  return (
    <Flex vertical gap={16}>
      {task.status === 'pending_review' && (
        <Alert
          message={`Aguardando Revisão: Atualmente com o perfil ${task.current_reviewer_role?.toUpperCase()}`}
          type="info"
          showIcon
          style={{ borderRadius: '8px' }}
        />
      )}

      <FormRenderer
        fields={fields}
        values={currentAnswers}
        onFieldChange={handleFieldChange}
        isCompleted={task.is_completed}
        disabled={disabled}
        roleMode={roleMode}
        activeReviews={activeReviews}
        allReviews={allReviews}
        onAddReviewComment={handleAddReviewComment}
        onSubmit={handleSubmit}
        onReopen={() => {}}
      />

      {isCurrentRevisor && (
        <ReviewActionToolbar
          onAccept={handleAcceptReview}
          onReject={handleRejectReview}
          isSubmitting={isActionPending}
        />
      )}
    </Flex>
  )
}
