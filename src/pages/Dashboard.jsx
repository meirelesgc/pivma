import { useAuth } from '../hooks/useAuth'
import { Card, Typography, Space, Row, Col, Statistic } from 'antd'
import { useTranslation } from 'react-i18next'
import { 
  BarChartOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined 
} from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography

export function DashboardPage() {
  const { user } = useAuth()
  const { t } = useTranslation()

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ marginBottom: 8 }}>
          <Title level={2} style={{ fontFamily: 'var(--font-accent)', margin: 0 }}>
            {t('dashboard.welcome', { name: user?.name })}
          </Title>
          <Text type="secondary">{t('dashboard.successMessage')}</Text>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} sm={8}>
            <Card bordered={false} className="modern-card">
              <Statistic 
                title={t('dashboard.metricsSection')}
                value={12} 
                prefix={<BarChartOutlined style={{ color: 'var(--primary-color)' }} />} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card bordered={false} className="modern-card">
              <Statistic 
                title={t('dashboard.recentActivity')}
                value={95} 
                suffix="%" 
                prefix={<CheckCircleOutlined style={{ color: 'var(--primary-color)' }} />} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card bordered={false} className="modern-card">
              <Statistic 
                title="Tempo Médio"
                value={4} 
                suffix="d" 
                prefix={<ClockCircleOutlined style={{ color: 'var(--primary-color)' }} />} 
              />
            </Card>
          </Col>
        </Row>

        <Card 
          title={<Text strong>{t('dashboard.loggedArea')}</Text>} 
          bordered={false} 
          className="modern-card"
        >
          <Paragraph>
            Este é o seu painel de controle da <strong>Plataforma Inteligente de Validação de Métodos Alternativos</strong>.
            Utilize o menu lateral para navegar entre as diferentes funcionalidades do sistema.
          </Paragraph>
        </Card>
      </Space>
    </div>
  )
}
