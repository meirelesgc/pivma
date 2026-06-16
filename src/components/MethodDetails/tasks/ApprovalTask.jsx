import { useState } from 'react'
import { Button, List, Space, Alert, Tag, Divider, Typography } from 'antd'
import { CheckCircleOutlined, InfoCircleOutlined, LikeOutlined, UserOutlined, MailOutlined } from '@ant-design/icons'
import { useAuth } from '../../../hooks/useAuth'
import { useUsers } from '../../../hooks/useUsers'
import { useProcesses } from '../../../hooks/useProcesses'

const { Text, Title, Paragraph } = Typography

export function ApprovalTask({ task, onToggle }) {
  const { user: currentUser } = useAuth()
  const { data: users = [] } = useUsers()
  const {
    processInstanceRoles = [],
    processInstanceTasks = [],
    pendingInvites = [],
    updateProcessInstanceTask
  } = useProcesses()

  const [isSubmitting, setIsSubmitting] = useState(false)

  // 1. Verificar dependência sequencial
  const stepTasks = processInstanceTasks
    .filter(t => t.process_instance_step_id === task.process_instance_step_id)
    .sort((a, b) => a.id - b.id)
  
  const currentIndex = stepTasks.findIndex(t => t.id === task.id)
  const isBlocked = currentIndex > 0 && stepTasks.slice(0, currentIndex).some(t => !t.is_completed)

  // 2. Verificar se o usuário atual possui o papel responsável
  const userRoles = processInstanceRoles
    .filter(r => r.instance_id === task.process_instance_id && r.user_id === currentUser?.id)
    .map(r => r.role)
  const canExecute = userRoles.includes(task.role)

  // 3. Carregar sumário de toda a estrutura montada
  const rolesToSummarize = [
    'Patrocinador',
    'Grupo Gestor',
    'Grupo de Seleção de Amostras',
    'Laboratório Líder',
    'Laboratórios Participantes',
    'Estatístico',
    'Colaboradores e Observadores',
    'Especialistas Temáticos (Comitê ADHOC)'
  ]

  const structureSummary = rolesToSummarize.map(roleName => {
    const assignedUsers = processInstanceRoles
      .filter(r => r.instance_id === task.process_instance_id && r.role === roleName)
      .map(r => {
        const u = users.find(user => user.id === r.user_id)
        return u ? `${u.name} (${u.email})` : `Usuário #${r.user_id}`
      })

    const pendingEmails = pendingInvites
      .filter(i => i.process_instance_id === task.process_instance_id && i.target_role === roleName && i.status === 'sent')
      .map(i => `${i.email} (Convite Pendente)`)

    return {
      role: roleName,
      people: [...assignedUsers, ...pendingEmails]
    }
  })

  const handleApprove = () => {
    setIsSubmitting(true)
    updateProcessInstanceTask(
      { taskInstanceId: task.id, isCompleted: true },
      {
        onSuccess: () => {
          setIsSubmitting(false)
          if (onToggle) onToggle()
        },
        onError: () => {
          setIsSubmitting(false)
        }
      }
    )
  }

  if (isBlocked) {
    return (
      <Alert
        message="Aprovação Bloqueada"
        description="Esta tarefa depende da conclusão de todas as atribuições anteriores de planejamento da estrutura."
        type="warning"
        showIcon
        icon={<InfoCircleOutlined />}
        style={{ borderRadius: '12px' }}
      />
    )
  }

  if (task.is_completed) {
    return (
      <div style={{ padding: '12px 0' }}>
        <Alert
          message="Estrutura Aprovada Formalmente"
          description="A estrutura montada para o planejamento foi validada e aprovada pelo BraCVAM."
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
          style={{ borderRadius: '12px', marginBottom: '24px' }}
        />
        
        <Title level={5} style={{ fontFamily: 'Barlow, sans-serif', fontSize: '15px', color: '#595959', marginBottom: '16px' }}>
          Resumo da Estrutura Aprovada:
        </Title>
        <List
          bordered
          dataSource={structureSummary}
          renderItem={item => (
            <List.Item style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '12px 16px' }}>
              <Text strong style={{ fontSize: '14px', color: '#262626' }}>{item.role}</Text>
              {item.people.length === 0 ? (
                <Text type="secondary" italic style={{ fontSize: '13px', marginTop: '4px' }}>Ninguém atribuído</Text>
              ) : (
                <div style={{ marginTop: '6px', paddingLeft: '8px' }}>
                  {item.people.map((p, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '4px 0' }}>
                      {p.includes('(Convite Pendente)') ? (
                        <MailOutlined style={{ color: '#fa8c16', fontSize: '13px' }} />
                      ) : (
                        <UserOutlined style={{ color: '#52c41a', fontSize: '13px' }} />
                      )}
                      <Text style={{ fontSize: '13px' }}>{p}</Text>
                    </div>
                  ))}
                </div>
              )}
            </List.Item>
          )}
          style={{ borderRadius: '12px', backgroundColor: '#fafafa' }}
        />
      </div>
    )
  }

  if (!canExecute) {
    return (
      <Alert
        message="Acesso Restrito"
        description={`Apenas usuários associados ao papel de "${task.role}" na instância podem aprovar formalmente esta estrutura.`}
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        style={{ borderRadius: '12px' }}
      />
    )
  }

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      <Paragraph style={{ fontFamily: 'Lexend, sans-serif', margin: 0, color: '#595959', fontSize: '14px' }}>
        Por favor, revise o resumo dos papéis definidos para esta instância de validação. Caso a estrutura planejada esteja em conformidade, realize a aprovação formal para avançar o processo.
      </Paragraph>

      <List
        bordered
        dataSource={structureSummary}
        renderItem={item => (
          <List.Item style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '12px 16px' }}>
            <Text strong style={{ fontSize: '14px', color: '#262626' }}>{item.role}</Text>
            {item.people.length === 0 ? (
              <Text type="secondary" italic style={{ fontSize: '13px', marginTop: '4px' }}>Ninguém atribuído</Text>
            ) : (
              <div style={{ marginTop: '6px', paddingLeft: '8px' }}>
                {item.people.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '4px 0' }}>
                    {p.includes('(Convite Pendente)') ? (
                      <MailOutlined style={{ color: '#fa8c16', fontSize: '13px' }} />
                    ) : (
                      <UserOutlined style={{ color: '#1890ff', fontSize: '13px' }} />
                    )}
                    <Text style={{ fontSize: '13px' }}>{p}</Text>
                  </div>
                ))}
              </div>
            )}
          </List.Item>
        )}
        style={{ borderRadius: '12px', backgroundColor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}
      />

      <Divider style={{ margin: '8px 0' }} />

      <Button
        type="primary"
        icon={<LikeOutlined />}
        onClick={handleApprove}
        loading={isSubmitting}
        block
        style={{
          fontFamily: 'Lexend, sans-serif',
          height: '45px',
          borderRadius: '10px',
          fontWeight: '600',
          fontSize: '15px',
          backgroundColor: '#1890ff',
          borderColor: '#1890ff',
          boxShadow: '0 4px 12px rgba(24, 144, 255, 0.15)'
        }}
      >
        Aprovar Estrutura Formalmente
      </Button>
    </Space>
  )
}
