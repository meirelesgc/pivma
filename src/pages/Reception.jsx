import { Typography, Button, Row, Col, Card, Space, Flex } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  RightOutlined, 
  InfoCircleOutlined, 
  TeamOutlined, 
  HistoryOutlined, 
  EyeOutlined
} from '@ant-design/icons'

const { Title, Paragraph, Text } = Typography

export function ReceptionPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <Flex vertical style={{ background: 'var(--background-secondary)' }}>
      {/* Hero Section */}
      <Flex 
        vertical 
        align="center" 
        justify="center" 
        style={{ 
          padding: '80px 24px', 
          background: 'linear-gradient(180deg, rgba(var(--primary-color-rgb), 0.05) 0%, var(--background-secondary) 100%)',
          textAlign: 'center' 
        }}
      >
        <Text strong style={{ 
          color: 'var(--primary-color)', 
          textTransform: 'uppercase', 
          letterSpacing: '0.1em', 
          marginBottom: 16,
          fontSize: 'var(--font-size-smaller)'
        }}>
          {t('reception.heroLabel')}
        </Text>
        <Title level={1} style={{ 
          fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
          marginTop: 0, 
          marginBottom: 24,
          fontFamily: 'var(--font-accent)',
          fontWeight: 'var(--weight-regular)'
        }}>
          {t('reception.heroTitle')}
        </Title>
        <Paragraph style={{ 
          fontSize: 'var(--font-size-large)', 
          color: 'var(--text-secondary)', 
          maxWidth: 700, 
          marginBottom: 48,
          lineHeight: 1.4,
          fontWeight: 'var(--weight-light)'
        }}>
          {t('reception.heroDescription')}
        </Paragraph>
        <Space size="large">
          <Button 
            type="primary" 
            size="large" 
            icon={<RightOutlined />} 
            iconPosition="right"
            onClick={() => navigate('/login')}
            style={{ 
              height: 48, 
              padding: '0 32px', 
              fontSize: 16,
              borderRadius: 'var(--radius-pill)',
              boxShadow: 'var(--shadow-tactile)'
            }}
          >
            {t('reception.accessButton')}
          </Button>
          <Button 
            size="large" 
            icon={<InfoCircleOutlined />}
            style={{ 
              height: 48, 
              padding: '0 32px', 
              fontSize: 16,
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--border-color)',
              background: 'var(--background-secondary)'
            }}
          >
            {t('reception.moreInfoButton')}
          </Button>
        </Space>
      </Flex>

      {/* Features Section */}
      <div style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <Row gutter={[32, 32]}>
          <Col xs={24} md={8}>
            <Card 
              bordered={false}
              className="modern-card"
              styles={{ body: { padding: 40 } }}
            >
              <div style={{ marginBottom: 24, fontSize: 32, color: 'var(--primary-color)' }}>
                <TeamOutlined />
              </div>
              <Title level={3} style={{ fontFamily: 'var(--font-accent)', marginBottom: 16 }}>
                {t('reception.features.collaboration.title')}
              </Title>
              <Paragraph style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-medium)', marginBottom: 0 }}>
                {t('reception.features.collaboration.description')}
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card 
              bordered={false}
              className="modern-card"
              styles={{ body: { padding: 40 } }}
            >
              <div style={{ marginBottom: 24, fontSize: 32, color: 'var(--primary-color)' }}>
                <HistoryOutlined />
              </div>
              <Title level={3} style={{ fontFamily: 'var(--font-accent)', marginBottom: 16 }}>
                {t('reception.features.traceability.title')}
              </Title>
              <Paragraph style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-medium)', marginBottom: 0 }}>
                {t('reception.features.traceability.description')}
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card 
              bordered={false}
              className="modern-card"
              styles={{ body: { padding: 40 } }}
            >
              <div style={{ marginBottom: 24, fontSize: 32, color: 'var(--primary-color)' }}>
                <EyeOutlined />
              </div>
              <Title level={3} style={{ fontFamily: 'var(--font-accent)', marginBottom: 16 }}>
                {t('reception.features.transparency.title')}
              </Title>
              <Paragraph style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-medium)', marginBottom: 0 }}>
                {t('reception.features.transparency.description')}
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Institutional Footer */}
      <div style={{ 
        padding: '40px 48px', 
        textAlign: 'center', 
        borderTop: '1px solid var(--border-color)',
        background: 'var(--background-secondary)'
      }}>
        <Text style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-small)' }}>
          {t('reception.footer.copyright')}
        </Text>
      </div>
    </Flex>
  )
}
