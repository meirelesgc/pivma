import { Button, Typography, Space, Flex } from 'antd'
import { useNavigate } from 'react-router-dom'

const { Title, Paragraph } = Typography

export function ReceptionPage() {
  const navigate = useNavigate()

  return (
    <Flex justify="center" align="center" vertical style={{ minHeight: '100vh', textAlign: 'center' }}>
      <Space direction="vertical" size="large">
        <Typography>
          <Title>Bem-vindo ao BraCVAM</Title>
          <Paragraph>Plataforma de Inspeção de Veículos e Ativos Móveis</Paragraph>
        </Typography>
        <Button type="primary" size="large" onClick={() => navigate('/login')}>
          Acessar a Plataforma
        </Button>
      </Space>
    </Flex>
  )
}
