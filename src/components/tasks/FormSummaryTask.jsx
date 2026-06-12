import { useFormResponses } from '../../hooks/useForms'
import { useDocuments, useTaskInstanceByProcessAndTask, useCompleteTask } from '../../hooks/useTasks'
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
  message
} from 'antd'
import { FileOutlined, CheckCircleOutlined } from '@ant-design/icons'

const { Title, Paragraph, Text } = Typography

export function FormSummaryTask({ task, taskInstance, processId, canEdit = true }) {
  const { user } = useAuth()
  
  // 1. Obter respostas do formulário
  const { data: responses, isLoading: isLoadingResponses } = useFormResponses(processId)
  
  // 2. Obter instância da tarefa de upload (ID = 2) para carregar os documentos associados
  const { data: uploadInstance, isLoading: isLoadingUploadInstance } = useTaskInstanceByProcessAndTask(processId, 2)
  
  // 3. Obter documentos
  const { data: documents, isLoading: isLoadingDocs } = useDocuments(uploadInstance?.id)

  const completeTaskMutation = useCompleteTask()

  const handleConfirmSubmit = async () => {
    try {
      await completeTaskMutation.mutateAsync({
        taskInstanceId: taskInstance.id,
        userId: user.id
      })
      message.success('Submissão efetuada com sucesso!')
    } catch (err) {
      message.error('Erro ao enviar submissão: ' + err.message)
    }
  }

  const isLoading = isLoadingResponses || isLoadingUploadInstance || isLoadingDocs

  if (isLoading) {
    return <Skeleton active paragraph={{ rows: 8 }} />
  }

  // Encontrar a resposta do formulário Dados Gerais (form_id = 1) - pega a última versão salva
  const form1Responses = responses?.filter(r => r.form_id === 1) || []
  const latestResponseObj = form1Responses[form1Responses.length - 1]
  const generalDataResponse = latestResponseObj?.responses || {}


  return (
    <div className="form-summary-task">
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>{task.name}</Title>
          <Paragraph type="secondary">
            Revise as informações preenchidas e os documentos anexados antes de confirmar o envio definitivo do seu processo de validação.
          </Paragraph>
        </div>

        <Alert
          message="Revisão Necessária"
          description="Após confirmar o envio, os dados serão bloqueados e encaminhados para a triagem automatizada por IA."
          type="info"
          showIcon
          style={{ borderRadius: 'var(--radius-m)' }}
        />

        <Card bordered title="Dados Gerais do Método" styles={{ body: { padding: '24px' } }} style={{ borderRadius: 'var(--radius-l)' }}>
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

        <Card bordered title="Documentação de Suporte" styles={{ body: { padding: '24px' } }} style={{ borderRadius: 'var(--radius-l)' }}>
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

        <Divider style={{ margin: '16px 0' }} />

        <Button
          type="primary"
          size="large"
          icon={<CheckCircleOutlined />}
          onClick={handleConfirmSubmit}
          loading={completeTaskMutation.isPending}
          disabled={!canEdit}
          style={{
            height: '48px',
            borderRadius: 'var(--radius-m)',
            padding: '0 36px',
            alignSelf: 'flex-start'
          }}
        >
          Confirmar e Submeter para Análise
        </Button>
      </Space>
    </div>
  )
}
