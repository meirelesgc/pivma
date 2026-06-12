import React from 'react'
import { useCompleteTask } from '../../hooks/useTasks'
import { useAuth } from '../../hooks/useAuth'
import {
  Typography,
  Button,
  Card,
  Space,
  Alert,
  message,
  Flex,
  Badge
} from 'antd'
import { DownloadOutlined, FileExcelOutlined, CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons'

const { Title, Paragraph, Text } = Typography

export function DocumentDownloadTask({ task, taskInstance, processId, canEdit = true }) {
  const { user } = useAuth()
  const [downloaded, setDownloaded] = React.useState(false)
  const completeTaskMutation = useCompleteTask()

  const handleDownload = async () => {
    try {
      // Cria um link temporário para download de um arquivo excel mockado
      const content = "ID,Amostra,Laboratorio,Viabilidade_MTT,Classificacao\n1,AM-001-2026,LNBio,, \n2,AM-002-2026,LNBio,, \n3,AM-003-2026,LNBio,, "
      const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", "template_resultados_BRA-2026-005.csv")
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setDownloaded(true)
      message.success('Download do template iniciado!')

      // Se a tarefa ainda não estiver concluída, marca-a como completa
      if (taskInstance.status !== 'completed' && canEdit) {
        await completeTaskMutation.mutateAsync({
          taskInstanceId: taskInstance.id,
          userId: user.id
        })
        message.success('Tarefa de download concluída!')
      }
    } catch (err) {
      message.error('Erro ao registrar conclusão da tarefa: ' + err.message)
    }
  }

  const isCompleted = taskInstance.status === 'completed'
  const isPending = completeTaskMutation.isPending

  return (
    <div className="document-download-task">
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        <div>
          <Title level={4} style={{ margin: 0, fontFamily: 'var(--font-accent)', fontWeight: 400 }}>
            {task.name}
          </Title>
          <Paragraph type="secondary" style={{ marginTop: 4 }}>
            Baixe o documento obrigatório ou planilha de template necessária para a execução do teste.
          </Paragraph>
        </div>

        <Card 
          bordered 
          className="modern-card"
          style={{ 
            background: isCompleted ? '#fafafa' : '#fff',
            borderLeft: isCompleted ? '4px solid #52c41a' : '4px solid var(--primary-color)' 
          }}
        >
          <Flex align="center" justify="space-between" gap={16} wrap="wrap">
            <Flex align="center" gap={16}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: 'var(--radius-m)',
                backgroundColor: '#f0fdf4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #b7eb8f'
              }}>
                <FileExcelOutlined style={{ fontSize: 28, color: '#52c41a' }} />
              </div>
              <Flex vertical>
                <Space>
                  <Text strong style={{ fontSize: '15px' }}>template_resultados_BRA-2026-005.csv</Text>
                  {isCompleted && <Badge status="success" text="Baixado" />}
                </Space>
                <Text type="secondary" style={{ fontSize: '12px' }}>Tamanho: 15 KB | Versão homologada: v1.0.3</Text>
              </Flex>
            </Flex>

            <Button
              type={isCompleted ? "default" : "primary"}
              size="large"
              icon={<DownloadOutlined />}
              onClick={handleDownload}
              loading={isPending}
              disabled={(!canEdit && !isCompleted)}
              style={{ borderRadius: 'var(--radius-m)', height: '44px' }}
            >
              {isCompleted ? "Baixar Novamente" : "Baixar Template Oficial"}
            </Button>
          </Flex>
        </Card>

        {isCompleted ? (
          <Alert
            message="Download Concluído com Sucesso"
            description={
              <Space direction="vertical" size={4}>
                <Text>Você já efetuou o download do template e está habilitado para preenchimento dos ensaios.</Text>
                {taskInstance.completed_at && (
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Registrado em: {new Date(taskInstance.completed_at).toLocaleString('pt-BR')}
                  </Text>
                )}
              </Space>
            }
            type="success"
            showIcon
            icon={<CheckCircleOutlined />}
            style={{ borderRadius: 'var(--radius-m)' }}
          />
        ) : (
          <Alert
            message="Instruções de Execução"
            description="Após fazer o download, utilize exatamente as colunas e abas estruturadas na planilha para preencher seus dados experimentais. Não altere o formato do arquivo para evitar erros de validação na etapa de submissão."
            type="info"
            showIcon
            icon={<InfoCircleOutlined />}
            style={{ borderRadius: 'var(--radius-m)' }}
          />
        )}
      </Space>
    </div>
  )
}
