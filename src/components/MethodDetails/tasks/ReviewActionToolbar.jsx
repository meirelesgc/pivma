import { Button, Card, Flex, Space, Typography } from 'antd'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons'

const { Text } = Typography

export function ReviewActionToolbar({ onAccept, onReject, isSubmitting }) {
  return (
    <Card
      style={{
        marginTop: '24px',
        borderRadius: '12px',
        border: '1.5px dashed #1890ff',
        backgroundColor: '#e6f7ff',
        boxShadow: '0 4px 12px rgba(24, 144, 255, 0.05)',
        fontFamily: 'Lexend, sans-serif'
      }}
      bodyStyle={{ padding: '16px 24px' }}
    >
      <Flex justify="space-between" align="center" wrap="wrap" gap={16}>
        <div>
          <Text strong style={{ fontSize: '15px', color: '#0050b3', display: 'block', fontFamily: 'Barlow, sans-serif' }}>
            Painel de Revisão
          </Text>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            Como revisor designado, analise os dados preenchidos e tome uma decisão sobre o formulário.
          </Text>
        </div>

        <Space size={12}>
          <Button
            type="primary"
            danger
            icon={<CloseOutlined />}
            loading={isSubmitting}
            onClick={onReject}
            style={{ borderRadius: '8px', fontWeight: '600' }}
          >
            Recusar e Devolver
          </Button>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            loading={isSubmitting}
            onClick={onAccept}
            style={{ borderRadius: '8px', fontWeight: '600', backgroundColor: '#52c41a', borderColor: '#52c41a' }}
          >
            Aprovar e Avançar
          </Button>
        </Space>
      </Flex>
    </Card>
  )
}
