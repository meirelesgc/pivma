import { Layout } from 'antd'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const { Content } = Layout

export function BaseLayout() {
  const { user } = useAuth()

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
      <Header />
      <Layout style={{ overflow: 'hidden' }}>
        {user && <Sidebar />}
        <Content style={{ overflowY: 'auto', height: '100%' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

