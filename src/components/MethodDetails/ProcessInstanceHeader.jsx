import { Typography, Card, Flex, Tag, Progress } from 'antd'

const { Title, Text } = Typography

export function ProcessInstanceHeader({ instance, overallProgress, _onBack }) {
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


        </Flex>
      </Card>
    </>
  )
}
