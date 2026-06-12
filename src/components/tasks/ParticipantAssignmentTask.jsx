import React from 'react'
import { useUsers } from '../../hooks/useUsers'
import { 
  useProcessDetails, 
  useAddProcessParticipant, 
  useRemoveProcessParticipant 
} from '../../hooks/useProcesses'
import { 
  useCompleteTask, 
  useApproveTask, 
  useRejectTask, 
  useComments 
} from '../../hooks/useTasks'
import { useAuth } from '../../hooks/useAuth'
import {
  Card,
  Button,
  Select,
  List,
  Avatar,
  Space,
  Typography,
  Alert,
  message,
  Popconfirm,
  Input,
  Modal,
  Flex,
  Divider,
  Tag
} from 'antd'
import {
  UserOutlined,
  PlusOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  SendOutlined
} from '@ant-design/icons'

const { Title, Paragraph, Text } = Typography
const { TextArea } = Input

export function ParticipantAssignmentTask({ task, taskInstance, processId, canEdit = true, myRoleId, myRoleName }) {
  const { user: currentUser } = useAuth()
  const { data: users, isLoading: isLoadingUsers } = useUsers()
  const { data: process, isLoading: isLoadingProcess } = useProcessDetails(processId)
  const { data: comments, isLoading: isLoadingComments } = useComments(taskInstance.id)

  const addParticipantMutation = useAddProcessParticipant()
  const removeParticipantMutation = useRemoveProcessParticipant()
  const completeTaskMutation = useCompleteTask()
  const approveTaskMutation = useApproveTask()
  const rejectTaskMutation = useRejectTask()

  const [selectedUserId, setSelectedUserId] = React.useState(null)
  const [rejectModalVisible, setRejectModalVisible] = React.useState(false)
  const [rejectionReason, setRejectionReason] = React.useState('')

  const targetRoleId = task.target_role_id
  const targetRoleName = 
    targetRoleId === 2 ? 'Patrocinador' :
    targetRoleId === 3 ? 'Grupo Gestor' :
    targetRoleId === 4 ? 'Coordenador do Grupo Gestor' : 'Participante'

  const isMutating = 
    addParticipantMutation.isPending || 
    removeParticipantMutation.isPending || 
    completeTaskMutation.isPending || 
    approveTaskMutation.isPending || 
    rejectTaskMutation.isPending

  const isLoading = isLoadingUsers || isLoadingProcess || isLoadingComments

  if (isLoading) {
    return <Card loading bordered={false} />
  }

  // Obter participantes do processo que possuem o papel alvo desta tarefa
  const targetParticipants = process?.participants?.filter(p => p.process_role_id === targetRoleId) || []

  // Filtrar usuários para o Select (excluir os que já são participantes com esse papel)
  const assignedUserIds = targetParticipants.map(p => p.user_id)
  const eligibleUsers = users?.filter(u => !assignedUserIds.includes(u.id)) || []

  const handleAdd = async () => {
    if (!selectedUserId) {
      message.warning('Selecione um usuário para adicionar.')
      return
    }
    try {
      await addParticipantMutation.mutateAsync({
        processInstanceId: processId,
        userId: selectedUserId,
        processRoleId: targetRoleId
      })
      message.success('Participante adicionado com sucesso!')
      setSelectedUserId(null)
    } catch (err) {
      message.error('Erro ao adicionar participante: ' + err.message)
    }
  }

  const handleRemove = async (userId) => {
    try {
      await removeParticipantMutation.mutateAsync({
        processInstanceId: processId,
        userId,
        processRoleId: targetRoleId
      })
      message.success('Participante removido do papel.')
    } catch (err) {
      message.error('Erro ao remover participante: ' + err.message)
    }
  }

  const handleSubmit = async () => {
    if (targetParticipants.length === 0) {
      message.warning(`Você precisa atribuir pelo menos um participante ao papel de ${targetRoleName} antes de prosseguir.`)
      return
    }
    try {
      await completeTaskMutation.mutateAsync({
        taskInstanceId: taskInstance.id,
        userId: currentUser.id
      })
      message.success('Tarefa enviada com sucesso!')
    } catch (err) {
      message.error('Erro ao concluir tarefa: ' + err.message)
    }
  }

  const handleApprove = async () => {
    try {
      await approveTaskMutation.mutateAsync({
        taskInstanceId: taskInstance.id,
        userId: currentUser.id
      })
      message.success('Atribuição aprovada!')
    } catch (err) {
      message.error('Erro ao aprovar tarefa: ' + err.message)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      message.warning('Por favor, informe a justificativa da rejeição.')
      return
    }
    try {
      await rejectTaskMutation.mutateAsync({
        taskInstanceId: taskInstance.id,
        userId: currentUser.id,
        commentText: rejectionReason
      })
      message.success('Atribuição rejeitada e devolvida para correção.')
      setRejectModalVisible(false)
      setRejectionReason('')
    } catch (err) {
      message.error('Erro ao rejeitar tarefa: ' + err.message)
    }
  }

  const isAwaitingApproval = taskInstance.status === 'awaiting_approval'
  const isCompleted = taskInstance.status === 'completed'
  const isRejected = taskInstance.status === 'rejected'

  // O aprovador é o coordenador (process_role_id === 4) ou os approver_roles definidos
  const isApprover = task.approver_roles?.includes(myRoleId) || myRoleId === 4

  // Quem pode editar de fato a lista de participantes
  // Apenas se a tarefa não estiver concluída ou aguardando aprovação, e o usuário tiver o cargo de editor
  const userCanEdit = canEdit && !isAwaitingApproval && !isCompleted

  // Comentários de rejeição recentes
  const rejectionComments = comments?.filter(c => c.content.startsWith('Justificativa de rejeição:')) || []
  const latestRejectionComment = rejectionComments[rejectionComments.length - 1]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      
      {/* Alertas de Status */}
      {isAwaitingApproval && (
        <Alert
          message="Aguardando Aprovação"
          description={
            isApprover 
              ? "Esta atribuição de participante foi submetida pelo Proponente e aguarda sua revisão e aprovação técnica."
              : "A atribuição de participante foi enviada com sucesso e está sob revisão do Coordenador do Grupo Gestor."
          }
          type="info"
          showIcon
          icon={<ClockCircleOutlined />}
          style={{ borderRadius: 'var(--radius-m)' }}
        />
      )}

      {isCompleted && (
        <Alert
          message="Tarefa Concluída e Aprovada"
          description={`Os participantes para o papel de ${targetRoleName} foram formalizados e aprovados no planejamento.`}
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
          style={{ borderRadius: 'var(--radius-m)' }}
        />
      )}

      {isRejected && (
        <Alert
          message="Ajustes Solicitados pelo Aprovador"
          description={
            <div>
              <Text>A atribuição atual foi rejeitada e precisa ser revisada.</Text>
              {latestRejectionComment && (
                <div style={{ marginTop: '8px', padding: '12px', background: 'rgba(255, 255, 255, 0.4)', borderRadius: '6px', borderLeft: '3px solid #ff4d4f' }}>
                  <Text strong>Motivo apontado:</Text>
                  <Paragraph style={{ margin: 0, fontStyle: 'italic' }}>{latestRejectionComment.content.replace('Justificativa de rejeição: ', '')}</Paragraph>
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

      {/* Cabeçalho da Tarefa */}
      <Flex justify="space-between" align="flex-start" wrap="wrap" gap={16}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Atribuir Papel: {targetRoleName}</Title>
          <Paragraph type="secondary" style={{ margin: 0, marginTop: '4px' }}>
            {task.name}. Atribua o(s) participante(s) adequado(s) que atuará(ão) como {targetRoleName} no processo.
          </Paragraph>
        </div>

        {/* Ações de Aprovação para o Coordenador */}
        {isAwaitingApproval && isApprover && (
          <Space>
            <Button 
              danger 
              size="large"
              icon={<CloseCircleOutlined />}
              onClick={() => setRejectModalVisible(true)}
              loading={isMutating}
              style={{ borderRadius: 'var(--radius-m)', height: '44px' }}
            >
              Recusar Atribuição
            </Button>
            <Button 
              type="primary"
              size="large"
              icon={<CheckCircleOutlined />}
              onClick={handleApprove}
              loading={isMutating}
              style={{ borderRadius: 'var(--radius-m)', height: '44px', padding: '0 24px' }}
            >
              Aprovar Atribuição
            </Button>
          </Space>
        )}
      </Flex>

      {/* Formulário de Seleção (apenas para quem pode editar e se não estiver travado) */}
      {userCanEdit && (
        <Card bordered={false} style={{ background: '#f8fafc', borderRadius: 'var(--radius-l)', border: '1px solid #e2e8f0' }}>
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            <Text strong>Adicionar Novo Integrante para {targetRoleName}:</Text>
            <Flex gap={12} align="center">
              <Select
                placeholder="Selecione um usuário do sistema..."
                style={{ flex: 1, height: '40px' }}
                value={selectedUserId}
                onChange={setSelectedUserId}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={eligibleUsers.map(u => ({
                  value: u.id,
                  label: `${u.name} (${u.email})`
                }))}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
                loading={isMutating}
                style={{ height: '40px', borderRadius: 'var(--radius-m)', padding: '0 20px' }}
              >
                Adicionar
              </Button>
            </Flex>
          </Space>
        </Card>
      )}

      {/* Listagem de Integrantes Atuais */}
      <Card 
        bordered 
        title={
          <Flex justify="space-between" align="center">
            <Text strong>Integrantes Atribuídos</Text>
            <Tag color="processing" style={{ borderRadius: 'var(--radius-pill)', margin: 0 }}>
              {targetParticipants.length} no total
            </Tag>
          </Flex>
        }
        style={{ borderRadius: 'var(--radius-l)' }}
      >
        {targetParticipants.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={targetParticipants}
            renderItem={(p) => (
              <List.Item
                actions={userCanEdit ? [
                  <Popconfirm
                    title="Remover integrante?"
                    description={`Deseja realmente remover ${p.user_name} deste papel?`}
                    onConfirm={() => handleRemove(p.user_id)}
                    okText="Remover"
                    cancelText="Cancelar"
                    okButtonProps={{ danger: true }}
                  >
                    <Button 
                      type="text" 
                      danger 
                      icon={<DeleteOutlined />} 
                      disabled={isMutating}
                    />
                  </Popconfirm>
                ] : []}
                style={{ padding: '12px 0' }}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      icon={<UserOutlined />} 
                      style={{ backgroundColor: '#e2e8f0', color: '#64748b' }} 
                    />
                  }
                  title={<Text strong style={{ fontSize: '14px' }}>{p.user_name}</Text>}
                  description={
                    <Space size={12}>
                      <Text type="secondary" style={{ fontSize: '12px' }}>Role: {targetRoleName}</Text>
                      {p.joined_at && (
                        <Text type="tertiary" style={{ fontSize: '11px' }}>
                          Adicionado em: {new Date(p.joined_at).toLocaleDateString()}
                        </Text>
                      )}
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Flex vertical align="center" justify="center" style={{ padding: '32px 0' }}>
            <UserOutlined style={{ fontSize: '32px', color: '#cbd5e1', marginBottom: '8px' }} />
            <Text type="secondary">Nenhum integrante atribuído a este papel no momento.</Text>
          </Flex>
        )}
      </Card>

      {/* Botão de Envio Principal (para o Editor) */}
      {userCanEdit && (
        <Flex justify="flex-end" style={{ marginTop: '12px' }}>
          <Button
            type="primary"
            size="large"
            icon={<SendOutlined />}
            onClick={handleSubmit}
            loading={isMutating}
            style={{ borderRadius: 'var(--radius-m)', height: '48px', padding: '0 32px' }}
          >
            {task.requires_approval ? 'Enviar para Aprovação' : 'Salvar e Continuar'}
          </Button>
        </Flex>
      )}

      {/* Modal de Justificativa de Rejeição */}
      <Modal
        title="Recusar Atribuição de Participantes"
        open={rejectModalVisible}
        onOk={handleReject}
        onCancel={() => {
          setRejectModalVisible(false)
          setRejectionReason('')
        }}
        confirmLoading={isMutating}
        okText="Confirmar Recusa"
        cancelText="Voltar"
        okButtonProps={{ danger: true }}
      >
        <Space direction="vertical" size={16} style={{ width: '100%', marginTop: '12px' }}>
          <Text>Informe o motivo da recusa desta atribuição para orientar o proponente:</Text>
          <TextArea
            rows={4}
            placeholder="Ex: O coordenador indicado deve possuir titulação x..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </Space>
      </Modal>
    </div>
  )
}
