import { Typography, Flex, Card, Result } from 'antd'
import { SettingOutlined, ToolOutlined } from '@ant-design/icons'
import { useAuth } from '../hooks/useAuth'
import { Navigate } from 'react-router-dom'

const { Title, Text } = Typography

export function ConfigureProcessesPage() {
  const { user } = useAuth()

  // Bloqueia acesso caso não seja administrador
  if (!user || user.system_role !== 'admin') {
    return <Navigate to="/workspace" replace />
  }

  return (
    <div style={{ padding: '32px' }}>
      {/* Cabeçalho */}
      <Flex vertical gap={8} style={{ marginBottom: '32px' }}>
        <Flex align="center" gap={12}>
          <SettingOutlined style={{ fontSize: '28px', color: '#025ECC' }} />
          <Title level={2} style={{ margin: 0, fontFamily: 'Barlow' }}>
            Configurar processos
          </Title>
        </Flex>
        <Text type="secondary" style={{ fontSize: '16px', fontFamily: 'Lexend' }}>
          Área de administração para modelagem, definição e parametrização dos fluxos de validação de métodos alternativos.
        </Text>
      </Flex>

      {/* Card de Placeholder */}
      <Card
        style={{
          borderRadius: '20px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)',
          border: '1px solid #d9d9d9',
          backgroundColor: '#fff',
          padding: '24px'
        }}
      >
        <Result
          icon={<ToolOutlined style={{ color: '#025ECC', fontSize: '64px' }} />}
          title={
            <Title level={3} style={{ fontFamily: 'Barlow', color: '#111827', margin: 0 }}>
              Área de Configuração de Processos
            </Title>
          }
          subTitle={
            <Text style={{ fontFamily: 'Lexend', color: '#6b7280', fontSize: '15px' }}>
              Esta funcionalidade está em fase de planejamento. Em breve, administradores poderão criar e customizar etapas, requisitos e fluxos de trabalho para os métodos.
            </Text>
          }
        />
      </Card>
    </div>
  )
}
