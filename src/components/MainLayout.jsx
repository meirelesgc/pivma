import { Layout } from 'antd'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { useAuth } from '../hooks/useAuth'

const { Content } = Layout

export function MainLayout() {
  const { user } = useAuth()

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header />
      <Layout>
        {user && <Sidebar />}
        <Layout 
          style={{ 
            marginLeft: user ? 260 : 0, 
            transition: 'margin-left 0.2s',
            background: 'var(--background-primary)'
          }}
        >
          <Content 
            style={{ 
              minHeight: 'calc(100vh - 64px)',
              overflowY: 'auto',
              padding: user ? '32px' : '0',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Outlet />
            </div>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  )
}
