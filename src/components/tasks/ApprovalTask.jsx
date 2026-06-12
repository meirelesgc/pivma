import React from 'react'
import { useFormResponses } from '../../hooks/useForms'
import {
  useDocuments,
  useTaskInstanceByProcessAndTask,
  useCompleteTask,
  useFieldFeedbacks,
  useCreateFieldFeedback,
  useDeleteFieldFeedback,
  useRequestAdjustments
} from '../../hooks/useTasks'
import { useProcessEvents } from '../../hooks/useProcesses'
import { useAuth } from '../../hooks/useAuth'
import {
  Typography,
  Button,
  Card,
  Descriptions,
  List,
  Space,
  Divider,
  Alert,
  Skeleton,
  Timeline,
  Tag,
  message,
  Flex,
  Drawer,
  Form,
  Input,
  Radio
} from 'antd'
import {
  FileOutlined,
  CheckCircleOutlined,
  AuditOutlined,
  AlertOutlined,
  PlusOutlined,
  DeleteOutlined,
  CommentOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'

const { Title, Paragraph, Text } = Typography
const { TextArea } = Input

export function ApprovalTask({ task, taskInstance, processId }) {
  const { user } = useAuth()
  const [complaintForm] = Form.useForm()

  // Drawer para adicionar observações/reclamações
  const [drawerVisible, setDrawerVisible] = React.useState(false)
  const [activeField, setActiveField] = React.useState(null)

  // 1. Obter respostas do formulário
  const { data: responses, isLoading: isLoadingResponses } = useFormResponses(processId)
  
  // 2. Obter instâncias das outras tarefas para recuperar o histórico
  const { data: uploadInstance, isLoading: isLoadingUploadInstance } = useTaskInstanceByProcessAndTask(processId, 2)
  const { data: aiInstance, isLoading: isLoadingAiInstance } = useTaskInstanceByProcessAndTask(processId, 4)
  
  // 3. Obter documentos
  const { data: documents, isLoading: isLoadingDocs } = useDocuments(uploadInstance?.id)

  // 4. Obter histórico de eventos do processo
  const { data: events, isLoading: isLoadingEvents } = useProcessEvents(processId)

  // 5. Obter feedbacks de campos cadastrados (tanto da IA quanto da BRACVAM)
  const { data: feedbacks, isLoading: isLoadingFeedbacks } = useFieldFeedbacks(processId)

  const completeTaskMutation = useCompleteTask()
  const createFeedbackMutation = useCreateFieldFeedback()
  const deleteFeedbackMutation = useDeleteFieldFeedback()
  const requestAdjustmentsMutation = useRequestAdjustments()

  const handleApprove = async () => {
    try {
      await completeTaskMutation.mutateAsync({
        taskInstanceId: taskInstance.id,
        userId: user.id
      })
      message.success('Etapa de Submissão e Triagem aprovada com sucesso!')
    } catch (err) {
      message.error('Erro ao aprovar etapa: ' + err.message)
    }
  }

  const handleRequestAdjustments = async () => {
    try {
      await requestAdjustmentsMutation.mutateAsync({
        processId,
        userId: user.id
      })
      message.success('Ajustes solicitados ao proponente. Processo devolvido para correção.')
    } catch (err) {
      message.error('Erro ao solicitar ajustes: ' + err.message)
    }
  }

  const handleAddFeedback = async (values) => {
    try {
      await createFeedbackMutation.mutateAsync({
        process_instance_id: processId,
        task_instance_id: taskInstance.id,
        field_name: activeField,
        type: values.type,
        title: values.title,
        description: values.description,
        tip: values.tip,
        created_by: user.id // Criado pelo Administrador logado
      })
      
      message.success('Apontamento registrado com sucesso!')
      complaintForm.resetFields()
      setDrawerVisible(false)
    } catch (err) {
      message.error('Erro ao salvar apontamento: ' + err.message)
    }
  }

  const handleDeleteFeedback = async (id) => {
    try {
      await deleteFeedbackMutation.mutateAsync(id)
      message.success('Apontamento removido.')
    } catch (err) {
      console.error(err)
      message.error('Erro ao remover apontamento.')
    }
  }

  const openComplaintDrawer = (fieldName) => {
    setActiveField(fieldName)
    setDrawerVisible(true)
  }

  const isLoading = isLoadingResponses || isLoadingUploadInstance || isLoadingAiInstance || isLoadingDocs || isLoadingEvents || isLoadingFeedbacks

  if (isLoading) {
    return <Skeleton active paragraph={{ rows: 10 }} />
  }

  const form1Responses = responses?.filter(r => r.form_id === 1) || []
  const latestResponseObj = form1Responses[form1Responses.length - 1]
  const generalDataResponse = latestResponseObj?.responses || {}
  const isAdmin = user?.system_role === 'admin'

  // Filtrar feedbacks criados pela IA (created_by === 0) e pela BRACVAM (created_by !== 0)
  const iaFeedbacks = feedbacks?.filter(f => f.created_by === 0) || []
  const bracvamFeedbacks = feedbacks?.filter(f => f.created_by !== 0) || []

  // Formatar a timeline de eventos
  const timelineItems = events?.map(event => {
    let color = 'gray'
    if (event.event_type === 'submission') color = 'blue'
    if (event.event_type === 'approval') color = 'green'
    if (event.event_type === 'contestation') color = 'red'
    if (event.event_type === 'task_completed') color = 'green'
    if (event.event_type === 'adjustments_requested') color = 'orange'

    return {
      color: color,
      children: (
        <Space direction="vertical" size={2}>
          <Text strong>{event.description}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {new Date(event.created_at).toLocaleString()}
          </Text>
        </Space>
      )
    }
  }) || []

  // Visualização para Usuário Comum (Aguardando aprovação)
  if (!isAdmin) {
    // Verificar se o último evento foi solicitação de ajustes.
    // Se foi, mostrar alerta proeminente e a lista de reclamações do BraCVAM
    const lastEvent = events?.[events.length - 1]
    const isWaitingAdjustments = lastEvent?.event_type === 'adjustments_requested'

    return (
      <div className="approval-task-user">
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          {isWaitingAdjustments ? (
            <Alert
              message="Ajustes Solicitados pela BRACVAM"
              description="A equipe técnica do BraCVAM analisou sua submissão e apontou inconformidades que necessitam de correção. Verifique o histórico de eventos abaixo ou as observações nas tarefas iniciais."
              type="warning"
              showIcon
              icon={<ExclamationCircleOutlined style={{ fontSize: 24 }} />}
              style={{ borderRadius: 'var(--radius-m)', padding: '16px' }}
            />
          ) : (
            <Alert
              message="Aguardando Análise Técnica do BraCVAM"
              description="Seu processo foi submetido com sucesso e a equipe técnica da BRACVAM está revisando a documentação e os pareceres."
              type="info"
              showIcon
              icon={<AuditOutlined style={{ fontSize: 24 }} />}
              style={{ borderRadius: 'var(--radius-m)', padding: '16px' }}
            />
          )}

          {bracvamFeedbacks.length > 0 && (
            <Card bordered title="Observações e Inconformidades Apontadas" style={{ borderRadius: 'var(--radius-l)' }}>
              <List
                itemLayout="vertical"
                dataSource={bracvamFeedbacks}
                renderItem={(fb) => (
                  <List.Item>
                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                      <Flex justify="space-between" align="center">
                        <Text strong style={{ fontSize: '15px' }}>{fb.title}</Text>
                        <Tag color={fb.type === 'suggestion' ? 'blue' : 'warning'}>
                          {fb.type === 'suggestion' ? 'Sugestão' : 'Inconsistência'}
                        </Tag>
                      </Flex>
                      <Text type="secondary" style={{ fontSize: '12px' }}>Campo: <Text strong>{fb.field_name === 'objective' ? 'Objetivo' : 'Descrição Detalhada'}</Text></Text>
                      <Paragraph>{fb.description}</Paragraph>
                      {fb.tip && (
                        <Alert 
                          message={`Como corrigir: ${fb.tip}`} 
                          type="warning" 
                          style={{ padding: '8px 12px', marginTop: 4, borderRadius: 4 }} 
                        />
                      )}
                    </Space>
                  </List.Item>
                )}
              />
            </Card>
          )}

          <Card bordered title="Histórico do Processo" style={{ borderRadius: 'var(--radius-l)' }}>
            <Timeline items={timelineItems} />
          </Card>

          <Card bordered title="Resumo do Envio" style={{ borderRadius: 'var(--radius-l)' }}>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Nome do Método">{generalDataResponse.method_name || 'Não informado'}</Descriptions.Item>
              <Descriptions.Item label="Objetivo">{generalDataResponse.objective || 'Não informado'}</Descriptions.Item>
              <Descriptions.Item label="Descrição Detalhada">{generalDataResponse.description || 'Não informado'}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Space>
      </div>
    )
  }

  // Renderizar feedbacks de um campo específico na visão de Admin
  const renderFieldFeedbacks = (fieldName) => {
    const fieldFbs = bracvamFeedbacks.filter(f => f.field_name === fieldName)
    if (fieldFbs.length === 0) return null

    return (
      <div style={{ marginTop: '12px', background: '#fafafa', padding: '12px', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
        <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>
          Apontamentos Registrados (BRACVAM):
        </Text>
        <List
          size="small"
          dataSource={fieldFbs}
          renderItem={(fb) => (
            <List.Item
              actions={[
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteFeedback(fb.id)}
                  size="small"
                />
              ]}
              style={{ padding: '8px 0' }}
            >
              <List.Item.Meta
                title={
                  <Space>
                    <Text strong style={{ fontSize: '13px' }}>{fb.title}</Text>
                    <Tag color={fb.type === 'suggestion' ? 'blue' : 'warning'} style={{ fontSize: '10px', lineHeight: '1.2' }}>
                      {fb.type === 'suggestion' ? 'Sugestão' : 'Inconsistência'}
                    </Tag>
                  </Space>
                }
                description={fb.description}
              />
            </List.Item>
          )}
        />
      </div>
    )
  }

  // Visualização para Administrador (Análise e Aprovação)
  return (
    <div className="approval-task-admin">
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={16}>
          <div>
            <Title level={4} style={{ margin: 0 }}>{task.name}</Title>
            <Paragraph type="secondary" style={{ margin: 0 }}>
              Revise as informações, pareceres da IA e registre apontamentos de inconformidade por campo antes de deferir ou solicitar ajustes.
            </Paragraph>
          </div>
          <Space>
            <Button
              danger
              size="large"
              icon={<CommentOutlined />}
              onClick={handleRequestAdjustments}
              disabled={bracvamFeedbacks.length === 0}
              loading={requestAdjustmentsMutation.isPending}
              style={{
                height: '48px',
                borderRadius: 'var(--radius-m)'
              }}
            >
              Solicitar Ajustes ao Proponente
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<CheckCircleOutlined />}
              onClick={handleApprove}
              loading={completeTaskMutation.isPending}
              style={{
                height: '48px',
                borderRadius: 'var(--radius-m)',
                padding: '0 32px'
              }}
            >
              Aprovar Submissão
            </Button>
          </Space>
        </Flex>

        {/* Notificação sobre Contestações da IA */}
        {aiInstance?.contestation_justification && (
          <Alert
            message="Contestação da IA Enviada"
            description={
              <Space direction="vertical" size={4}>
                <Text>O proponente contestou os resultados da avaliação automatizada.</Text>
                <Text strong>Justificativa apresentada pelo proponente:</Text>
                <Text style={{ fontStyle: 'italic', background: 'rgba(255,255,255,0.5)', padding: '8px', borderRadius: '4px', display: 'block' }}>
                  "{aiInstance.contestation_justification}"
                </Text>
              </Space>
            }
            type="warning"
            showIcon
            icon={<AlertOutlined />}
            style={{ borderRadius: 'var(--radius-m)' }}
          />
        )}

        <Card 
          bordered 
          title="1. Dados Gerais do Método (Avaliação por Campo)" 
          style={{ borderRadius: 'var(--radius-l)' }}
        >
          <Descriptions column={1} bordered size="middle">
            <Descriptions.Item 
              label={
                <Flex justify="space-between" align="center" style={{ width: '100%' }}>
                  <Text strong>Nome do Método</Text>
                  <Button 
                    type="link" 
                    icon={<PlusOutlined />} 
                    size="small"
                    onClick={() => openComplaintDrawer('method_name')}
                  >
                    Apontar Falha
                  </Button>
                </Flex>
              }
            >
              <Text strong>{generalDataResponse.method_name || 'Não informado'}</Text>
              {renderFieldFeedbacks('method_name')}
            </Descriptions.Item>

            <Descriptions.Item 
              label={
                <Flex justify="space-between" align="center" style={{ width: '100%' }}>
                  <Text strong>Objetivo</Text>
                  <Button 
                    type="link" 
                    icon={<PlusOutlined />} 
                    size="small"
                    onClick={() => openComplaintDrawer('objective')}
                  >
                    Apontar Falha
                  </Button>
                </Flex>
              }
            >
              {generalDataResponse.objective || 'Não informado'}
              {renderFieldFeedbacks('objective')}
            </Descriptions.Item>

            <Descriptions.Item 
              label={
                <Flex justify="space-between" align="center" style={{ width: '100%' }}>
                  <Text strong>Descrição Detalhada</Text>
                  <Button 
                    type="link" 
                    icon={<PlusOutlined />} 
                    size="small"
                    onClick={() => openComplaintDrawer('description')}
                  >
                    Apontar Falha
                  </Button>
                </Flex>
              }
            >
              {generalDataResponse.description || 'Não informado'}
              {renderFieldFeedbacks('description')}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card bordered title="2. Documentação Anexada" style={{ borderRadius: 'var(--radius-l)' }}>
          {documents && documents.length > 0 ? (
            <List
              itemLayout="horizontal"
              dataSource={documents}
              renderItem={(doc) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<FileOutlined style={{ fontSize: 24, color: 'var(--primary-color)' }} />}
                    title={doc.file_name}
                    description={`Tamanho: ${(doc.file_size / 1024).toFixed(1)} KB`}
                  />
                </List.Item>
              )}
            />
          ) : (
            <Text type="secondary">Nenhum documento anexado.</Text>
          )}
        </Card>

        <Card bordered title="3. Parecer da Avaliação por IA" style={{ borderRadius: 'var(--radius-l)' }}>
          {aiInstance?.result ? (
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <Flex align="center" gap={8}>
                <Text strong>Score Automático:</Text>
                <Tag color={aiInstance.result.status === 'success' ? 'success' : 'warning'}>
                  {aiInstance.result.score}/100
                </Tag>
              </Flex>
              <Text>{aiInstance.result.message}</Text>
              
              {iaFeedbacks.length > 0 && (
                <>
                  <Divider style={{ margin: '8px 0' }} />
                  <Text strong>Pendências Encontradas pela IA:</Text>
                  <List
                    size="small"
                    dataSource={iaFeedbacks}
                    renderItem={(fb) => (
                      <List.Item style={{ padding: '4px 0' }}>
                        <Space>
                          <AlertOutlined style={{ color: 'var(--ant-warning-color, #d48806)' }} />
                          <Text strong>{fb.field_name === 'objective' ? 'Objetivo' : 'Descrição'}:</Text>
                          <Text>{fb.title} - {fb.tip}</Text>
                        </Space>
                      </List.Item>
                    )}
                  />
                </>
              )}
            </Space>
          ) : (
            <Text type="secondary">Resultado da IA não disponível.</Text>
          )}
        </Card>

        <Card bordered title="4. Histórico de Eventos e Trilha de Auditoria" style={{ borderRadius: 'var(--radius-l)' }}>
          <Timeline items={timelineItems} />
        </Card>
      </Space>

      {/* Drawer do Formulário de Não-Conformidade */}
      <Drawer
        title={
          <Space>
            <CommentOutlined />
            <span>Registrar Apontamento no Campo: {activeField === 'method_name' ? 'Nome do Método' : activeField === 'objective' ? 'Objetivo' : 'Descrição Detalhada'}</span>
          </Space>
        }
        placement="right"
        width={450}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        styles={{ body: { padding: '24px' } }}
      >
        <Form
          form={complaintForm}
          layout="vertical"
          onFinish={handleAddFeedback}
          initialValues={{ type: 'inconsistency' }}
        >
          <Form.Item
            label="Tipo de Apontamento"
            name="type"
            rules={[{ required: true }]}
          >
            <Radio.Group optionType="button" buttonStyle="solid">
              <Radio.Button value="inconsistency">Inconsistência (Bloqueante)</Radio.Button>
              <Radio.Button value="suggestion">Sugestão</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label="Título Resumido"
            name="title"
            rules={[{ required: true, message: 'Digite um título para a inconformidade' }]}
          >
            <Input placeholder="Ex: Informações insuficientes, Falha de formatação" />
          </Form.Item>

          <Form.Item
            label="Avaliação / Descrição Detalhada"
            name="description"
            rules={[{ required: true, message: 'Escreva a justificativa detalhada' }]}
          >
            <TextArea placeholder="Descreva por que o campo não está em conformidade..." rows={5} />
          </Form.Item>

          <Form.Item
            label="Dica de Correção (Como resolver)"
            name="tip"
          >
            <TextArea placeholder="Instruções para o proponente ajustar este ponto..." rows={3} />
          </Form.Item>

          <Form.Item style={{ marginTop: '24px' }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={createFeedbackMutation.isPending}
              style={{ borderRadius: 'var(--radius-m)', height: '40px' }}
            >
              Registrar Apontamento
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  )
}
