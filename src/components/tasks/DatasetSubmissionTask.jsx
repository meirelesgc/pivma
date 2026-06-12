import React from 'react'
import { useCompleteTask, useUploadDocument, useDocuments } from '../../hooks/useTasks'
import { useAuth } from '../../hooks/useAuth'
import {
  Typography,
  Button,
  Card,
  Upload,
  Table,
  Space,
  Alert,
  message,
  Flex,
  Steps,
  Progress,
  Tag
} from 'antd'
import { 
  InboxOutlined, 
  FileExcelOutlined, 
  CheckCircleOutlined, 
  LoadingOutlined, 
  CloseCircleOutlined,
  EyeOutlined
} from '@ant-design/icons'

const { Title, Paragraph, Text } = Typography
const { Dragger } = Upload

export function DatasetSubmissionTask({ task, taskInstance, processId, canEdit = true }) {
  const { user } = useAuth()
  
  const [fileList, setFileList] = React.useState([])
  const [validating, setValidating] = React.useState(false)
  const [validationResult, setValidationResult] = React.useState(null)
  const [validationProgress, setValidationProgress] = React.useState(0)
  
  const completeTaskMutation = useCompleteTask()
  const uploadDocumentMutation = useUploadDocument()
  
  const { data: existingDocs } = useDocuments(taskInstance.id)

  const isCompleted = taskInstance.status === 'completed'
  const isPending = completeTaskMutation.isPending || uploadDocumentMutation.isPending

  // Mock de dados validados para exibição na tabela preview
  const mockTableColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Código da Amostra', dataIndex: 'sample', key: 'sample' },
    { title: 'Laboratório', dataIndex: 'laboratory', key: 'laboratory' },
    { 
      title: 'Viabilidade MTT (%)', 
      dataIndex: 'viability', 
      key: 'viability',
      render: (val) => <Text strong color={parseFloat(val) <= 50 ? 'red' : 'green'}>{val}</Text>
    },
    { 
      title: 'Classificação Predita', 
      dataIndex: 'classification', 
      key: 'classification',
      render: (val) => (
        <Tag color={val === 'Irritante' ? 'volcano' : 'green'}>
          {val}
        </Tag>
      )
    }
  ]

  const mockTableData = [
    { key: '1', id: '1', sample: 'AM-001-2026', laboratory: 'Laboratório Líder', viability: '42.5%', classification: 'Irritante' },
    { key: '2', id: '2', sample: 'AM-002-2026', laboratory: 'Laboratório Líder', viability: '89.1%', classification: 'Não Irritante' },
    { key: '3', id: '3', sample: 'AM-003-2026', laboratory: 'Laboratório Líder', viability: '15.8%', classification: 'Irritante' },
    { key: '4', id: '4', sample: 'AM-004-2026', laboratory: 'Laboratório Líder', viability: '75.2%', classification: 'Não Irritante' },
    { key: '5', id: '5', sample: 'AM-005-2026', laboratory: 'Laboratório Líder', viability: '48.9%', classification: 'Irritante' }
  ]

  const runValidation = (file) => {
    setValidating(true)
    setValidationResult(null)
    setValidationProgress(10)

    // Simula etapas da validação automatizada de colunas e dados
    const interval = setInterval(() => {
      setValidationProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval)
          return 100
        }
        return prev + 30
      })
    }, 400)

    setTimeout(() => {
      setValidating(false)
      setValidationResult({
        success: true,
        templateVersion: 'v1.0.3',
        columnsMatched: ['ID', 'Amostra', 'Laboratorio', 'Viabilidade_MTT'],
        rowCount: 5,
        errors: []
      })
      message.success('Dataset validado com sucesso! Nenhuma inconsistência encontrada.')
    }, 1500)
  }

  const handleComplete = async () => {
    if (fileList.length === 0) {
      message.warning('Faça o upload do dataset preenchido.')
      return
    }

    try {
      // 1. Simular persistência do documento
      const file = fileList[0]
      await uploadDocumentMutation.mutateAsync({
        process_instance_id: processId,
        task_instance_id: taskInstance.id,
        user_id: user.id,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type
      })

      // 2. Concluir a tarefa do workflow
      await completeTaskMutation.mutateAsync({
        taskInstanceId: taskInstance.id,
        userId: user.id
      })

      message.success('Resultados experimentais enviados e validados com sucesso!')
    } catch (err) {
      message.error('Erro ao concluir envio de resultados: ' + err.message)
    }
  }

  const uploadProps = {
    name: 'file',
    multiple: false,
    fileList,
    disabled: !canEdit || validating,
    beforeUpload(file) {
      const isExcel = file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
      if (!isExcel) {
        message.error('O arquivo deve ser no formato CSV, XLSX ou XLS.')
        return Upload.LIST_IGNORE
      }
      return true
    },
    onChange(info) {
      setFileList(info.fileList.slice(-1)) // Apenas mantém o arquivo mais recente
      if (info.fileList.length > 0 && info.file.status !== 'removed') {
        runValidation(info.file)
      } else {
        setValidationResult(null)
      }
    },
    customRequest({ file, onSuccess }) {
      setTimeout(() => onSuccess("ok"), 500)
    }
  }

  return (
    <div className="dataset-submission-task">
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        <div>
          <Title level={4} style={{ margin: 0, fontFamily: 'var(--font-accent)', fontWeight: 400 }}>
            {task.name}
          </Title>
          <Paragraph type="secondary" style={{ marginTop: 4 }}>
            Submeta a planilha preenchida com os dados experimentais dos ensaios. O motor de validação analisará a estrutura antes do envio definitivo.
          </Paragraph>
        </div>

        {isCompleted ? (
          <>
            <Alert
              message="Dataset Submetido e Consolidado"
              description={
                <Space direction="vertical" size={4}>
                  <Text>Os resultados experimentais foram validados e arquivados no repositório central de dados.</Text>
                  {existingDocs && existingDocs.length > 0 && (
                    <Text strong>Arquivo arquivado: {existingDocs[0].file_name}</Text>
                  )}
                  {taskInstance.completed_at && (
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Enviado em: {new Date(taskInstance.completed_at).toLocaleString('pt-BR')}
                    </Text>
                  )}
                </Space>
              }
              type="success"
              showIcon
              icon={<CheckCircleOutlined />}
              style={{ borderRadius: 'var(--radius-m)' }}
            />

            <Card 
              bordered 
              title={
                <Space>
                  <EyeOutlined style={{ color: 'var(--primary-color)' }} />
                  <Text strong>Preview dos Dados Extraídos</Text>
                </Space>
              }
              style={{ borderRadius: 'var(--radius-l)', boxShadow: 'var(--shadow-s)' }}
            >
              <Table 
                columns={mockTableColumns} 
                dataSource={mockTableData} 
                pagination={false} 
                size="middle"
              />
            </Card>
          </>
        ) : (
          <>
            <Dragger {...uploadProps} style={{ padding: '40px', background: 'var(--bg-light)', border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-l)' }}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined style={{ color: 'var(--primary-color)' }} />
              </p>
              <p className="ant-upload-text">Selecione ou arraste a planilha preenchida (CSV / XLSX)</p>
              <p className="ant-upload-hint">O motor de validação fará uma checagem em tempo real sobre colunas e tipos de dados.</p>
            </Dragger>

            {validating && (
              <Card bordered style={{ borderRadius: 'var(--radius-l)' }}>
                <Space direction="vertical" size={12} style={{ width: '100%', textAlign: 'center' }}>
                  <LoadingOutlined style={{ fontSize: 24, color: 'var(--primary-color)' }} spin />
                  <Text strong>Validando estrutura e conteúdo da planilha...</Text>
                  <Progress percent={validationProgress} status="active" showInfo={false} strokeColor="var(--primary-color)" />
                </Space>
              </Card>
            )}

            {validationResult && (
              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                <Alert
                  message="Validação Concluída: Aderente"
                  description={
                    <ul style={{ paddingLeft: '16px', margin: 0 }}>
                      <li>Versão do Template compatível: <Text strong>{validationResult.templateVersion}</Text></li>
                      <li>Colunas identificadas e mapeadas: <Text code>{validationResult.columnsMatched.join(', ')}</Text></li>
                      <li>Linhas de dados extraídas: <Text strong>{validationResult.rowCount}</Text></li>
                    </ul>
                  }
                  type="success"
                  showIcon
                  style={{ borderRadius: 'var(--radius-m)' }}
                />

                <Card 
                  bordered 
                  title={
                    <Space>
                      <EyeOutlined style={{ color: 'var(--primary-color)' }} />
                      <Text strong>Visualização Prévia dos Dados Lidos</Text>
                    </Space>
                  }
                  styles={{ body: { padding: 0 } }}
                  style={{ borderRadius: 'var(--radius-l)', overflow: 'hidden' }}
                >
                  <Table 
                    columns={mockTableColumns} 
                    dataSource={mockTableData} 
                    pagination={false} 
                    size="small"
                  />
                </Card>

                <div style={{ marginTop: 8 }}>
                  <Button
                    type="primary"
                    size="large"
                    onClick={handleComplete}
                    loading={isPending}
                    disabled={!canEdit}
                    style={{ borderRadius: 'var(--radius-m)', height: '48px', padding: '0 32px' }}
                  >
                    Confirmar e Consolidar Dados
                  </Button>
                </div>
              </Space>
            )}
          </>
        )}
      </Space>
    </div>
  )
}
