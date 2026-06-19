import { Typography, Card, Flex, Button, Tag, Progress } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

export function ProcessInstanceHeader({ instance, overallProgress, onBack }) {
  if (!instance) return null

  return (
    <>
      <Card
        style={{
          marginBottom: '24px',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)'
        }}
      >
        <Flex justify="space-between" align="center" wrap="wrap" gap={16}>
          <div>
            <Tag color="blue" style={{ fontSize: '13px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '6px' }}>
              BRA-2026-{instance.id}
            </Tag>
            <Title level={2} style={{ margin: '8px 0 4px 0' }}>
              Método de Validação
            </Title>
            <Text type="secondary">
              Criado em {new Date(instance.createdAt).toLocaleDateString('pt-BR')}
            </Text>
          </div>

          <Flex vertical style={{ minWidth: '200px' }} gap={4}>
            <Flex justify="space-between">
              <Text strong>Progresso Geral</Text>
              <Text strong style={{ color: '#52c41a' }}>{overallProgress}%</Text>
            </Flex>
            <Progress
              percent={overallProgress}
              status="active"
              strokeColor={{
                '0%': '#1677ff',
                '100%': '#52c41a',
              }}
              style={{ margin: 0 }}
            />
          </Flex>
        </Flex>
      </Card>
    </>
  )
}
