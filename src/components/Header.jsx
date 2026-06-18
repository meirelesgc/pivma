import { Layout, Flex, Button, Divider } from 'antd'
import { BellOutlined, QuestionCircleOutlined } from '@ant-design/icons'

const { Header: AntHeader } = Layout

export function Header() {
  return (
    <AntHeader style={{ 
      backgroundColor: '#efefef', 
      borderBottom: '1px solid #d9d9d9', 
      lineHeight: '64px', 
      height: '64px',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      {/* Lado Esquerdo - Logotipos e Divisores */}
      <Flex align="center" gap={16}>
        <img 
          src="/marca-colorido.svg" 
          alt="Marca PI*VMA" 
          style={{ height: '32px', display: 'block' }} 
        />
        <Divider type="vertical" style={{ height: '24px', borderColor: '#d9d9d9', margin: 0 }} />
        <img 
          src="/marca-bracvam-colorido.svg" 
          alt="Marca BraCVAM" 
          style={{ height: '39px', display: 'block' }} 
        />
        <Divider type="vertical" style={{ height: '24px', borderColor: '#d9d9d9', margin: 0 }} />
        <img 
          src="/marca-fiocruz-preto.svg" 
          alt="Marca FIOCRUZ" 
          style={{ height: '34px', display: 'block' }} 
        />
      </Flex>

      {/* Lado Direito - Ações de Notificação e Suporte */}
      <Flex align="center" gap={12}>
        <Button 
          type="text" 
          icon={<BellOutlined />} 
          style={{ display: 'flex', alignItems: 'center' }}
        >
          Notificações
        </Button>
        <Button 
          type="text" 
          icon={<QuestionCircleOutlined />} 
          style={{ display: 'flex', alignItems: 'center' }}
        >
          Suporte
        </Button>
      </Flex>
    </AntHeader>
  )
}

