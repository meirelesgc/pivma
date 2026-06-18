import { Button, Typography, Space, Flex } from 'antd'
import { useNavigate } from 'react-router-dom'

const { Title, Paragraph } = Typography

export function ReceptionPage() {
  const navigate = useNavigate()

  return (
    <Flex
      justify="center"
      align="center"
      vertical
      style={{
        minHeight: '100vh',
        backgroundImage: "url('/arco.svg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <Space direction="vertical" size="large" style={{ textAlign: 'center' }}>
        <Typography>
          <Title style={{ color: 'var(--color-02)', fontFamily: 'var(--font-family-title)', fontWeight: '800' }}>
            Bem-vindo ao PI*VMA
          </Title>
          <Paragraph style={{ fontSize: '16px', color: '#595959', fontFamily: 'var(--font-family-body)' }}>
            Plataforma Inteligente de Validação de Métodos Alternativos
          </Paragraph>
          <Paragraph type="secondary" style={{ fontSize: '13px', fontFamily: 'var(--font-family-body)' }}>
            BraCVAM FIOCRUZ
          </Paragraph>
        </Typography>
        <Button type="primary" size="large" onClick={() => navigate('/login')} style={{ height: '48px', borderRadius: '8px', fontWeight: '600' }}>
          Acessar a Plataforma
        </Button>
      </Space>
    </Flex>
  )
}
