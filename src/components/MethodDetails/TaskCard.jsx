import { Button, Card, Typography, Space, Tag } from 'antd'
import {
  FormOutlined,
  EyeOutlined,
  FileTextOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  ExperimentOutlined,
  TableOutlined,
  AuditOutlined
} from '@ant-design/icons'
import { FormTask, ReviewTask, DefaultTask, AssignmentTask, ApprovalTask, SampleDefinitionTask, DataTemplateDefinitionTask, ReviewDecisionTask } from './tasks'

import { useAuth } from '../../hooks/useAuth'
import { useProcesses } from '../../hooks/useProcesses'

const { Title } = Typography

const taskTypeColors = {
  form: { color: 'blue', label: 'Formulário', icon: <FormOutlined /> },
  review: { color: 'purple', label: 'Revisão', icon: <EyeOutlined /> },
  assignment: { color: 'orange', label: 'Atribuição de Cargo', icon: <TeamOutlined /> },
  approval: { color: 'cyan', label: 'Aprovação Formal', icon: <SafetyCertificateOutlined /> },
  sample_definition: { color: 'magenta', label: 'Definição de Amostras', icon: <ExperimentOutlined /> },
  data_template_definition: { color: 'green', label: 'Template de Coleta', icon: <TableOutlined /> },
  review_decision: { color: 'red', label: 'Revisão e Decisão', icon: <AuditOutlined /> }
}

export function TaskCard({ task, onToggle }) {
  const { user: currentUser } = useAuth()
  const { processInstanceRoles = [] } = useProcesses()

  const typeConfig = taskTypeColors[task.type] || { color: 'default', label: task.type, icon: <FileTextOutlined /> }
  const isCompleted = task.is_completed

  // Determine user role in this process instance
  const userRoleObj = processInstanceRoles.find(
    r => r.instance_id === task.process_instance_id && r.user_id === currentUser?.id
  )
  const userRole = userRoleObj ? userRoleObj.role.toLowerCase() : 'view'

  const isFutureRevisor = task.type === 'form' &&
    (task.status === 'pending_submission' || task.status === 'analyzing_ai') &&
    task.required_reviewers &&
    task.required_reviewers.map(r => r.toLowerCase()).includes(userRole)

  const renderTaskContent = () => {
    switch (task.type) {
      case 'form':
        return <FormTask task={task} onToggle={onToggle} />
      case 'review':
        return <ReviewTask task={task} />
      case 'assignment':
        return <AssignmentTask task={task} onToggle={onToggle} />
      case 'approval':
        return <ApprovalTask task={task} onToggle={onToggle} />
      case 'sample_definition':
        return <SampleDefinitionTask task={task} onToggle={onToggle} />
      case 'data_template_definition':
        return <DataTemplateDefinitionTask task={task} onToggle={onToggle} />
      case 'review_decision':
        return <ReviewDecisionTask task={task} onToggle={onToggle} />
      default:
        return <DefaultTask task={task} />
    }
  }

  return (
    <Card
      style={{
        width: '100%',
        borderRadius: '16px',
        border: isCompleted ? '2.5px solid #b7eb8f' : '1.5px solid #f0f0f0',
        background: isCompleted
          ? 'linear-gradient(135deg, #f6ffed 0%, #e6ffed 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
        boxShadow: isCompleted
          ? '0 6px 16px rgba(82, 196, 26, 0.08)'
          : '0 6px 16px rgba(0, 0, 0, 0.03)',
        transition: 'all 0.3s ease'
      }}
      bodyStyle={{ padding: '24px' }}
    >
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <Space justify="space-between" align="center" style={{ width: '100%', display: 'flex' }}>
          <Space size={8}>
            <Tag
              color={typeConfig.color}
              icon={typeConfig.icon}
              style={{
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 'bold',
                fontFamily: 'Lexend, sans-serif'
              }}
            >
              {typeConfig.label.toUpperCase()}
            </Tag>
            {isFutureRevisor && (
              <Tag
                color="gold"
                style={{
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  fontFamily: 'Lexend, sans-serif'
                }}
              >
                SUA REVISÃO SERÁ NECESSÁRIA
              </Tag>
            )}
          </Space>
          <Tag
            color={isCompleted ? 'success' : 'warning'}
            style={{
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 'bold',
              fontFamily: 'Lexend, sans-serif'
            }}
          >
            {isCompleted ? 'CONCLUÍDA' : 'PENDENTE'}
          </Tag>
        </Space>

        <Title
          level={4}
          style={{
            margin: 0,
            textDecoration: isCompleted ? 'line-through' : 'none',
            color: isCompleted ? '#8c8c8c' : '#262626',
            fontFamily: 'Barlow, sans-serif',
            fontSize: '20px'
          }}
        >
          {task.name}
        </Title>

        {task.stepName && (
          <Typography.Text type="secondary" style={{ fontSize: '13px', display: 'block', marginTop: '-8px' }}>
            Etapa: <strong style={{ color: '#595959' }}>{task.stepName}</strong>
          </Typography.Text>
        )}

        {renderTaskContent()}

        {task.type !== 'form' && task.type !== 'assignment' && task.type !== 'approval' && task.type !== 'sample_definition' && task.type !== 'data_template_definition' && task.type !== 'review_decision' && (
          <Button
            type={isCompleted ? 'default' : 'primary'}
            onClick={onToggle}
            style={{
              fontFamily: 'Lexend, sans-serif',
              borderRadius: '8px',
              fontWeight: '600',
              marginTop: '8px'
            }}
            block
          >
            {isCompleted ? 'Marcar como Pendente' : 'Concluir Tarefa'}
          </Button>
        )}
      </Space>
    </Card>
  )
}
