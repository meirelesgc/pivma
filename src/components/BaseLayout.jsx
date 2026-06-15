import { Layout } from 'antd'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const { Content } = Layout

export function BaseLayout() {
  const { user } = useAuth()

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header />
      <Layout>
        {user && <Sidebar />}
        <Content>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

