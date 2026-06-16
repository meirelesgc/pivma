import { Typography, Card, Flex, Button, Tag } from 'antd'
import {
  LeftOutlined,
  RightOutlined,
  CheckOutlined,
  FormOutlined,
  EyeOutlined,
  FileTextOutlined,
  TeamOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography

const taskTypeColors = {
  form: { color: 'blue', label: 'Formulário', icon: <FormOutlined /> },
  review: { color: 'purple', label: 'Revisão', icon: <EyeOutlined /> },
  assignment: { color: 'orange', label: 'Atribuição', icon: <TeamOutlined /> },
  approval: { color: 'cyan', label: 'Aprovação', icon: <SafetyCertificateOutlined /> }
}

export function TaskCarousel({
  enrichedTasks,
  currentSlide,
  maxSlide,
  itemsPerPage,
  onNext,
  onPrev,
  onSetSlide
}) {
  if (enrichedTasks.length === 0) {
    return null
  }

  return (
    <Card
      style={{
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        border: '1px solid #f0f0f0',
        padding: '16px'
      }}
    >
      <Flex justify="space-between" align="center" style={{ marginBottom: '20px' }}>
        <div>
          <Title level={4} style={{ margin: 0, fontFamily: 'Barlow, sans-serif' }}>Selecione uma Tarefa</Title>
          <Text type="secondary" style={{ fontFamily: 'Lexend, sans-serif' }}>
            Navegue e clique em uma das tarefas da etapa para visualizar seus detalhes abaixo.
          </Text>
        </div>

        {/* Controles do Carrossel */}
        {enrichedTasks.length > itemsPerPage && (
          <Flex gap={8}>
            <Button
              icon={<LeftOutlined />}
              onClick={onPrev}
              disabled={currentSlide === 0}
            />
            <Button
              icon={<RightOutlined />}
              onClick={onNext}
              disabled={currentSlide === maxSlide}
            />
          </Flex>
        )}
      </Flex>

      {/* Carousel Track para Seleção */}
      <Flex gap={16} style={{ width: '100%', overflowX: 'auto', paddingBottom: '12px' }}>
        {enrichedTasks.map((task, idx) => {
          const typeConfig = taskTypeColors[task.type] || { color: 'default', label: task.type, icon: <FileTextOutlined /> }
          const isCompleted = task.is_completed
          const isSelected = idx === currentSlide

          return (
            <Card
              key={task.id}
              hoverable
              onClick={() => onSetSlide(idx)}
              style={{
                flex: '1 0 calc(33.33% - 11px)',
                maxWidth: 'calc(33.33% - 11px)',
                minWidth: '240px',
                borderRadius: '12px',
                transition: 'all 0.3s ease',
                border: isSelected
                  ? '2px solid #1677ff'
                  : (isCompleted ? '1.5px solid #b7eb8f' : '1px solid #f0f0f0'),
                background: isSelected
                  ? '#e6f4ff'
                  : (isCompleted ? '#f6ffed' : '#ffffff'),
                boxShadow: isSelected
                  ? '0 4px 12px rgba(22, 119, 255, 0.15)'
                  : 'none',
              }}
              bodyStyle={{ padding: '16px' }}
            >
              <Flex justify="space-between" align="center" style={{ marginBottom: '8px' }}>
                <Tag color={typeConfig.color} style={{ fontSize: '10px', fontWeight: 'bold' }}>
                  {typeConfig.label.toUpperCase()}
                </Tag>
                {isCompleted ? (
                  <Tag color="success" icon={<CheckOutlined />} style={{ margin: 0, fontSize: '10px' }}>
                    OK
                  </Tag>
                ) : (
                  <Tag color="warning" style={{ margin: 0, fontSize: '10px' }}>
                    PENDENTE
                  </Tag>
                )}
              </Flex>

              <Text
                strong
                ellipsis
                style={{
                  display: 'block',
                  fontSize: '14px',
                  color: isSelected ? '#1677ff' : '#262626',
                  textDecoration: isCompleted ? 'line-through' : 'none'
                }}
              >
                {task.name}
              </Text>
              {task.stepName && (
                <Text type="secondary" style={{ display: 'block', fontSize: '11px', marginTop: '4px' }} ellipsis>
                  Etapa: {task.stepName}
                </Text>
              )}
            </Card>
          )
        })}
      </Flex>

      {/* Dots indicadores do carrossel */}
      {enrichedTasks.length > itemsPerPage && (
        <Flex justify="center" gap={8} style={{ marginTop: '12px' }}>
          {Array.from({ length: maxSlide + 1 }).map((_, idx) => (
            <div
              key={idx}
              onClick={() => onSetSlide(idx)}
              style={{
                width: currentSlide === idx ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                backgroundColor: currentSlide === idx ? '#1677ff' : '#d9d9d9',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </Flex>
      )}
    </Card>
  )
}
