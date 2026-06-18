import { Button, Typography, Flex, Card, Row, Col, Space } from 'antd'
import { useNavigate } from 'react-router-dom'
import { ArrowRightOutlined } from '@ant-design/icons'

const { Title, Paragraph, Text } = Typography

export function ReceptionPage() {
  const navigate = useNavigate()

  return (
    <Flex
      vertical
      style={{
        minHeight: '100%',
        backgroundImage: "url('/arco.svg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        padding: '64px 32px 24px',
        boxSizing: 'border-box'
      }}
    >
      {/* Seção Hero */}
      <Flex 
        vertical 
        align="center" 
        style={{ 
          textAlign: 'center', 
          maxWidth: '800px', 
          margin: '0 auto',
          flex: 1,
          justifyContent: 'center'
        }}
      >
        <Text 
          style={{ 
            color: '#014E2A', 
            fontWeight: 600, 
            fontSize: '14px', 
            textTransform: 'uppercase', 
            letterSpacing: '1.5px',
            fontFamily: 'Lexend, sans-serif'
          }}
        >
          Plataforma de Validação de Métodos Alternativos
        </Text>
        
        <Title 
          level={1} 
          style={{ 
            fontSize: '40px', 
            fontWeight: 700, 
            color: '#111827', 
            marginTop: '16px', 
            marginBottom: '16px',
            fontFamily: 'Barlow, sans-serif',
            lineHeight: '1.2'
          }}
        >
          Eficiência e Precisão na<br />Validação de Métodos
        </Title>
        
        <Paragraph 
          style={{ 
            fontSize: '16px', 
            color: '#6B7280', 
            marginBottom: '32px',
            fontFamily: 'Lexend, sans-serif',
            lineHeight: '1.6'
          }}
        >
          Simplificando o processo de validação de métodos alternativos com colaboração em tempo real, rastreabilidade completa e análise inteligente de dados.
        </Paragraph>
        
        <Space size={16}>
          <Button 
            type="primary" 
            size="large" 
            onClick={() => navigate('/login')} 
            icon={<ArrowRightOutlined />}
            iconPosition="end"
            style={{ 
              height: '48px', 
              borderRadius: '12px', 
              fontWeight: 600, 
              backgroundColor: '#014E2A',
              fontFamily: 'Lexend, sans-serif',
              boxShadow: '0 4px 12px rgba(1, 78, 42, 0.2)',
              border: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            Acessar a Plataforma
          </Button>
          <Button 
            size="large" 
            style={{ 
              height: '48px', 
              borderRadius: '12px', 
              fontWeight: 600,
              fontFamily: 'Lexend, sans-serif',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            Saiba Mais
          </Button>
        </Space>
      </Flex>

      {/* Seção Features */}
      <div style={{ maxWidth: '1200px', width: '100%', margin: '48px auto 64px' }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <Card
              bordered={false}
              style={{
                borderRadius: '20px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                height: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.9)'
              }}
              bodyStyle={{ padding: '24px' }}
            >
              <Title 
                level={3} 
                style={{ 
                  color: '#014E2A', 
                  fontSize: '20px', 
                  fontWeight: 600,
                  fontFamily: 'Barlow, sans-serif',
                  marginTop: 0,
                  marginBottom: '12px'
                }}
              >
                Colaboração
              </Title>
              <Paragraph 
                style={{ 
                  color: '#6B7280', 
                  fontSize: '14px',
                  fontFamily: 'Lexend, sans-serif',
                  margin: 0,
                  lineHeight: '1.5'
                }}
              >
                Conecte proponentes, laboratórios e especialistas em um único ambiente integrado para gestão fluida de projetos de validação.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card
              bordered={false}
              style={{
                borderRadius: '20px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                height: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.9)'
              }}
              bodyStyle={{ padding: '24px' }}
            >
              <Title 
                level={3} 
                style={{ 
                  color: '#014E2A', 
                  fontSize: '20px', 
                  fontWeight: 600,
                  fontFamily: 'Barlow, sans-serif',
                  marginTop: 0,
                  marginBottom: '12px'
                }}
              >
                Rastreabilidade
              </Title>
              <Paragraph 
                style={{ 
                  color: '#6B7280', 
                  fontSize: '14px',
                  fontFamily: 'Lexend, sans-serif',
                  margin: 0,
                  lineHeight: '1.5'
                }}
              >
                Controle total sobre cada etapa do processo, com registro histórico de dados, amostras e decisões técnicas centralizadas.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card
              bordered={false}
              style={{
                borderRadius: '20px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                height: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.9)'
              }}
              bodyStyle={{ padding: '24px' }}
            >
              <Title 
                level={3} 
                style={{ 
                  color: '#014E2A', 
                  fontSize: '20px', 
                  fontWeight: 600,
                  fontFamily: 'Barlow, sans-serif',
                  marginTop: 0,
                  marginBottom: '12px'
                }}
              >
                Transparência
              </Title>
              <Paragraph 
                style={{ 
                  color: '#6B7280', 
                  fontSize: '14px',
                  fontFamily: 'Lexend, sans-serif',
                  margin: 0,
                  lineHeight: '1.5'
                }}
              >
                Garantia de integridade e visibilidade em todas as fases, desde a submissão inicial até a decisão regulatória final.
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Rodapé */}
      <Flex 
        justify="center" 
        align="center" 
        style={{ 
          maxWidth: '1200px', 
          width: '100%', 
          margin: '0 auto', 
          paddingTop: '24px', 
          borderTop: '1px solid #D9D9D9',
          textAlign: 'center'
        }}
      >
        <Text 
          style={{ 
            color: '#6B7280', 
            fontSize: '14px',
            fontFamily: 'Lexend, sans-serif'
          }}
        >
          © 2026 BraCVAM - Centro Brasileiro de Validação de Métodos Alternativos
        </Text>
      </Flex>
    </Flex>
  )
}
