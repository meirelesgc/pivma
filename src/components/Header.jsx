import { Layout, Typography, Space, Button, Badge } from 'antd'
import { BellOutlined, QuestionCircleOutlined } from '@ant-design/icons'

const { Header: AntHeader } = Layout
const { Text, Title } = Typography

export function Header({ title }) {
  return (
    <AntHeader
      style={{
        background: 'var(--background-secondary)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-color)',
        height: 64,
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        width: '100%'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32,
            height: 32,
            background: 'var(--primary-color)',
            borderRadius: 'var(--radius-s)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: 18
          }} />

          <Text strong style={{
            fontSize: 20,
            color: 'var(--text-primary)',
            letterSpacing: '-0.2px',
            fontFamily: 'var(--font-accent)',
            fontWeight: 400
          }}>
            Pi*VMA
          </Text>
        </div>

        {title && (
          <Title level={4} style={{ margin: 0, fontWeight: 400, fontFamily: 'var(--font-accent)' }}>
            {title}
          </Title>
        )}
      </div>

      <Space size="large">
        <Space size="middle">
          <Button
            type="text"
            icon={<Badge dot><BellOutlined style={{ fontSize: 18 }} /></Badge>}
            style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}
          >
            <Text type="secondary" style={{ fontSize: 'var(--font-size-small)' }}>
              Notificações
            </Text>
          </Button>
          <Button
            type="text"
            icon={<QuestionCircleOutlined style={{ fontSize: 18 }} />}
            style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}
          >
            <Text type="secondary" style={{ fontSize: 'var(--font-size-small)' }}>
              Suporte
            </Text>
          </Button>
        </Space>
      </Space>
    </AntHeader>
  )
}
