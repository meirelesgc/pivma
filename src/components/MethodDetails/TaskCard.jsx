import { Button, Card, Typography, Space, Tag } from 'antd'
import {
  FormOutlined,
  EyeOutlined,
  FileTextOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  ExperimentOutlined,
  TableOutlined
} from '@ant-design/icons'
import { FormTask, ReviewTask, DefaultTask, AssignmentTask, ApprovalTask, SampleDefinitionTask, DataTemplateDefinitionTask } from './tasks'

const { Title } = Typography

const taskTypeColors = {
  form: { color: 'blue', label: 'Formulário', icon: <FormOutlined /> },
  review: { color: 'purple', label: 'Revisão', icon: <EyeOutlined /> },
  assignment: { color: 'orange', label: 'Atribuição de Cargo', icon: <TeamOutlined /> },
  approval: { color: 'cyan', label: 'Aprovação Formal', icon: <SafetyCertificateOutlined /> },
  sample_definition: { color: 'magenta', label: 'Definição de Amostras', icon: <ExperimentOutlined /> },
  data_template_definition: { color: 'green', label: 'Template de Coleta', icon: <TableOutlined /> }
}

export function TaskCard({ task, onToggle }) {
  const typeConfig = taskTypeColors[task.type] || { color: 'default', label: task.type, icon: <FileTextOutlined /> }
  const isCompleted = task.is_completed

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

        {renderTaskContent()}

        {task.type !== 'form' && task.type !== 'assignment' && task.type !== 'approval' && task.type !== 'sample_definition' && task.type !== 'data_template_definition' && (
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
