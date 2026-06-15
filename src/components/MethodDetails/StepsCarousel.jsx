import { Typography, Card, Flex, message } from 'antd'
import {
  CheckOutlined,
  LockOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  FileTextOutlined,
  AuditOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography

const iconMap = {
  'file-text': <FileTextOutlined />,
  'calendar': <CalendarOutlined />,
  'check-circle': <CheckCircleOutlined />,
  'gavel': <AuditOutlined />,
}

export function StepsCarousel({ steps, instSteps, currentSelectedStepId, onSelectStep }) {
  return (
    <>
      <Title level={4} style={{ marginBottom: '16px' }}>Etapas do Processo</Title>
      
      <Flex gap={16} style={{ marginBottom: '32px', overflowX: 'auto', paddingBottom: '8px' }}>
        {steps.map((step, index) => {
          const instStep = instSteps.find(s => s.step_id === step.id)
          const isCompleted = instStep ? instStep.is_completed : false
          const prevStep = index > 0 ? steps[index - 1] : null
          const prevInstStep = prevStep ? instSteps.find(s => s.step_id === prevStep.id) : null
          const prevCompleted = !prevStep || (prevInstStep ? prevInstStep.is_completed : false)
          
          const isLocked = !isCompleted && !prevCompleted
          const isSelected = currentSelectedStepId === step.id

          let statusText = 'Disponível'
          let badgeBg = '#e6f4ff'
          let badgeColor = '#1677ff'
          let cardBg = '#fff'

          if (isCompleted) {
            statusText = 'Concluída'
            badgeBg = '#f6ffed'
            badgeColor = '#52c41a'
          } else if (isLocked) {
            statusText = 'Bloqueada'
            badgeBg = '#f5f5f5'
            badgeColor = '#bfbfbf'
            cardBg = '#fafafa'
          }

          return (
            <Card
              key={step.id}
              size="small"
              hoverable={!isLocked}
              onClick={() => {
                if (!isLocked) {
                  onSelectStep(step.id)
                } else {
                  message.warning('Esta etapa está bloqueada. Conclua as etapas anteriores primeiro.')
                }
              }}
              style={{
                minWidth: '220px',
                flex: 1,
                borderRadius: '12px',
                cursor: isLocked ? 'not-allowed' : 'pointer',
                backgroundColor: isSelected ? '#e6f4ff' : cardBg,
                border: isSelected ? '2px solid #1677ff' : '1px solid #f0f0f0',
                boxShadow: isSelected ? '0 4px 12px rgba(22, 119, 255, 0.15)' : 'none',
                opacity: isLocked ? 0.6 : 1,
                transition: 'all 0.3s ease'
              }}
            >
              <Flex align="center" gap={12}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: isSelected ? '#1677ff' : badgeBg,
                  color: isSelected ? '#fff' : badgeColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  transition: 'all 0.2s'
                }}>
                  {isCompleted ? <CheckOutlined /> : (isLocked ? <LockOutlined /> : iconMap[step.icone] || <FileTextOutlined />)}
                </div>
                <Flex vertical>
                  <Text strong style={{ fontSize: '14px', color: isLocked ? '#bfbfbf' : '#262626' }}>
                    {step.name}
                  </Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {statusText}
                  </Text>
                </Flex>
              </Flex>
            </Card>
          )
        })}
      </Flex>
    </>
  )
}
