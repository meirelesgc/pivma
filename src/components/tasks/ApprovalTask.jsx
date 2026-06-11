import { useFormResponses } from '../../hooks/useForms'
import { useDocuments, useTaskInstanceByProcessAndTask, useCompleteTask } from '../../hooks/useTasks'
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
  Flex
} from 'antd'
import { FileOutlined, CheckCircleOutlined, AuditOutlined, AlertOutlined } from '@ant-design/icons'

const { Title, Paragraph, Text } = Typography

export function ApprovalTask({ task, taskInstance, processId }) {
  const { user } = useAuth()
  
  // 1. Obter respostas do formulário
  const { data: responses, isLoading: isLoadingResponses } = useFormResponses(processId)
  
  // 2. Obter instâncias das outras tarefas para recuperar o histórico
  const { data: uploadInstance, isLoading: isLoadingUploadInstance } = useTaskInstanceByProcessAndTask(processId, 2)
  const { data: aiInstance, isLoading: isLoadingAiInstance } = useTaskInstanceByProcessAndTask(processId, 4)
  
  // 3. Obter documentos
  const { data: documents, isLoading: isLoadingDocs } = useDocuments(uploadInstance?.id)

  // 4. Obter histórico de eventos do processo
  const { data: events, isLoading: isLoadingEvents } = useProcessEvents(processId)

  const completeTaskMutation = useCompleteTask()

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

  const isLoading = isLoadingResponses || isLoadingUploadInstance || isLoadingAiInstance || isLoadingDocs || isLoadingEvents

  if (isLoading) {
    return <Skeleton active paragraph={{ rows: 10 }} />
  }

  const form1Responses = responses?.filter(r => r.form_id === 1) || []
  const latestResponseObj = form1Responses[form1Responses.length - 1]
  const generalDataResponse = latestResponseObj?.responses || {}

  const isAdmin = user?.system_role === 'admin'

  // Formatar a timeline de eventos
  const timelineItems = events?.map(event => {
    let color = 'gray'
    if (event.event_type === 'submission') color = 'blue'
    if (event.event_type === 'approval') color = 'green'
    if (event.event_type === 'contestation') color = 'red'
    if (event.event_type === 'task_completed') color = 'green'

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
    return (
      <div className="approval-task-user">
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          <Alert
            message="Aguardando Análise Técnica do BraCVAM"
            description="Seu processo foi submetido com sucesso e a equipe técnica da BRACVAM está revisando a documentação e os pareceres."
            type="info"
            showIcon
            icon={<AuditOutlined style={{ fontSize: 24 }} />}
            style={{ borderRadius: 'var(--radius-m)', padding: '16px' }}
          />

          <Card bordered title="Histórico do Processo" style={{ borderRadius: 'var(--radius-l)' }}>
            <Timeline items={timelineItems} />
          </Card>

          <Card bordered title="Resumo do Envio" style={{ borderRadius: 'var(--radius-l)' }}>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Nome do Método">{generalDataResponse.method_name || 'Não informado'}</Descriptions.Item>
              <Descriptions.Item label="Objetivo">{generalDataResponse.objective || 'Não informado'}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Space>
      </div>
    )
  }

  // Visualização para Administrador (Análise e Aprovação)
  return (
    <div className="approval-task-admin">
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        <Flex justify="space-between" align="center">
          <div>
            <Title level={4} style={{ margin: 0 }}>{task.name}</Title>
            <Paragraph type="secondary">
              Revise as informações consolidadas, pareceres de IA e contestações antes de deferir a etapa de Submissão e Triagem.
            </Paragraph>
          </div>
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
            Aprovar Submissão e Triagem
          </Button>
        </Flex>

        {/* Notificação sobre Contestações */}
        {aiInstance?.contestation_justification ? (
          <Alert
            message="Submissão com Contestação da IA"
            description={
              <Space direction="vertical" size={4}>
                <Text>O proponente contestou os resultados da avaliação automatizada.</Text>
                <Text strong>Justificativa apresentada:</Text>
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
        ) : (
          <Alert
            message="Sem contestações pendentes"
            description="A avaliação preliminar da IA foi aceita pelo proponente."
            type="success"
            showIcon
            style={{ borderRadius: 'var(--radius-m)' }}
          />
        )}

        <Card bordered title="1. Dados Gerais do Método" style={{ borderRadius: 'var(--radius-l)' }}>
          <Descriptions column={1} bordered size="middle">
            <Descriptions.Item label="Nome do Método">
              <Text strong>{generalDataResponse.method_name || 'Não informado'}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Objetivo">
              {generalDataResponse.objective || 'Não informado'}
            </Descriptions.Item>
            <Descriptions.Item label="Descrição Detalhada">
              {generalDataResponse.description || 'Não informado'}
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
                <Tag color="blue">{aiInstance.result.score}/100</Tag>
              </Flex>
              <Text>{aiInstance.result.message}</Text>
              <Divider style={{ margin: '8px 0' }} />
              <Text strong>Pontos de Conformidade:</Text>
              <ul style={{ paddingLeft: '20px' }}>
                {aiInstance.result.findings?.map((f, i) => <li key={i}><Text>{f}</Text></li>)}
              </ul>
            </Space>
          ) : (
            <Text type="secondary">Resultado da IA não disponível.</Text>
          )}
        </Card>

        <Card bordered title="4. Histórico de Eventos e Trilha de Auditoria" style={{ borderRadius: 'var(--radius-l)' }}>
          <Timeline items={timelineItems} />
        </Card>
      </Space>
    </div>
  )
}
