import React from 'react'
import { useCompleteTask } from '../../hooks/useTasks'
import { useAuth } from '../../hooks/useAuth'
import {
  Typography,
  Button,
  Card,
  Checkbox,
  Space,
  Alert,
  message,
  Divider,
  List,
  Tag
} from 'antd'
import { CheckCircleOutlined, InfoCircleOutlined, QrcodeOutlined } from '@ant-design/icons'

const { Title, Paragraph, Text } = Typography

export function AcknowledgementTask({ task, taskInstance, processId, canEdit = true }) {
  const { user } = useAuth()
  const [checked, setChecked] = React.useState(false)
  const completeTaskMutation = useCompleteTask()

  const handleConfirm = async () => {
    if (!checked) return

    try {
      await completeTaskMutation.mutateAsync({
        taskInstanceId: taskInstance.id,
        userId: user.id
      })
      message.success('Recebimento e declaração confirmados com sucesso!')
    } catch (err) {
      message.error('Erro ao confirmar: ' + err.message)
    }
  }

  const isCompleted = taskInstance.status === 'completed'
  const isPending = completeTaskMutation.isPending

  // Mock de códigos de amostra cega para mostrar caso o nome seja de amostras
  const isSampleConfirmation = task.name.toLowerCase().includes('codificação') || task.name.toLowerCase().includes('amostra')
  const mockSamples = ['AM-001-2026', 'AM-002-2026', 'AM-003-2026', 'AM-004-2026', 'AM-005-2026']

  return (
    <div className="acknowledgement-task">
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        <div>
          <Title level={4} style={{ margin: 0, fontFamily: 'var(--font-accent)', fontWeight: 400 }}>
            {task.name}
          </Title>
          <Paragraph type="secondary" style={{ marginTop: 4 }}>
            Esta tarefa exige sua confirmação e aceite formal para prosseguir no fluxo de validação.
          </Paragraph>
        </div>

        {isSampleConfirmation && (
          <Card 
            bordered 
            style={{ 
              background: '#f8fafc', 
              borderRadius: 'var(--radius-l)',
              boxShadow: 'var(--shadow-s)'
            }}
            title={
              <Space>
                <QrcodeOutlined style={{ color: 'var(--primary-color)' }} />
                <Text strong>Lotes de Amostras Blindadas Associados</Text>
              </Space>
            }
          >
            <List
              size="small"
              dataSource={mockSamples}
              renderItem={item => (
                <List.Item>
                  <Space justify="space-between" style={{ width: '100%' }}>
                    <Text code>{item}</Text>
                    <Tag color="cyan">Carga Selada</Tag>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        )}

        {isCompleted ? (
          <Alert
            message="Confirmação Efetuada"
            description={
              <Space direction="vertical" size={4}>
                <Text>Você declarou ciência e confirmou formalmente esta tarefa.</Text>
                {taskInstance.completed_at && (
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Confirmado em: {new Date(taskInstance.completed_at).toLocaleString('pt-BR')}
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
          <Card 
            bordered 
            className="modern-card"
            style={{ borderLeft: '4px solid var(--primary-color)' }}
          >
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <Checkbox
                checked={checked}
                onChange={e => setChecked(e.target.checked)}
                disabled={!canEdit}
                style={{ alignItems: 'flex-start' }}
              >
                <span style={{ display: 'inline-block', marginTop: '-2px', marginLeft: '6px' }}>
                  <Text strong style={{ display: 'block' }}>Declaração de Conformidade e Recebimento</Text>
                  <Text type="secondary" style={{ fontSize: '13px' }}>
                    Confirmo que recebi, revisei e estou de acordo com todos os termos, materiais ou dados fornecidos nesta etapa de execução experimental.
                  </Text>
                </span>
              </Checkbox>

              <Divider style={{ margin: '8px 0' }} />

              <Button
                type="primary"
                size="large"
                disabled={!checked || !canEdit}
                loading={isPending}
                onClick={handleConfirm}
                style={{ 
                  borderRadius: 'var(--radius-m)', 
                  height: '48px', 
                  padding: '0 32px',
                  boxShadow: checked ? '0 4px 12px rgba(0, 156, 59, 0.2)' : 'none'
                }}
              >
                Registrar Confirmação Oficial
              </Button>
            </Space>
          </Card>
        )}
      </Space>
    </div>
  )
}
