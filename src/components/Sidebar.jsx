import { Layout, Menu, Typography, Avatar, Button, Flex, Divider } from 'antd'
import { 
  AppstoreOutlined, 
  LogoutOutlined,
  UserOutlined
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'

const { Sider } = Layout
const { Text } = Typography

export function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const { user, logout } = useAuth()

  if (!user) return null

  const menuItems = [
    {
      key: 'platform-label',
      label: t('layout.sidebar.platform'),
      type: 'group',
      children: [
        {
          key: '/dashboard',
          icon: <AppstoreOutlined />,
          label: t('layout.sidebar.dashboard'),
        },
      ],
    },
  ]

  return (
    <Sider 
      width={260} 
      theme="light" 
      style={{ 
        borderRight: '1px solid var(--border-color)',
        height: 'calc(100vh - 64px)',
        position: 'fixed',
        left: 0,
        top: 64,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Flex vertical style={{ height: '100%' }} justify="space-between">
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={({ key }) => navigate(key)}
          items={menuItems}
          style={{ borderRight: 0, padding: '16px 8px' }}
        />

        <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)' }}>
          <Flex align="center" gap={12} style={{ marginBottom: 16 }}>
            <Avatar 
              size="large" 
              icon={<UserOutlined />} 
              style={{ backgroundColor: 'var(--primary-color)' }}
            >
              {user.name?.charAt(0)}
            </Avatar>
            <Flex vertical style={{ overflow: 'hidden' }}>
              <Text strong style={{ fontSize: 14 }} ellipsis>{user.name}</Text>
              <Text type="secondary" style={{ fontSize: 12 }} ellipsis>{user.email}</Text>
            </Flex>
          </Flex>
          
          <Button 
            type="text" 
            danger 
            icon={<LogoutOutlined />} 
            onClick={() => {
              logout()
              navigate('/')
            }}
            block
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'flex-start',
              height: 40,
              borderRadius: 'var(--radius-m)'
            }}
          >
            {t('layout.sidebar.logout')}
          </Button>
        </div>
      </Flex>
    </Sider>
  )
}
