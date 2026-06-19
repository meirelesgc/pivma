import { Layout, Button, Divider, Breadcrumb } from 'antd'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useState } from 'react'
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'

const { Content } = Layout

export function BaseLayout() {
  const { user } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  const getBreadcrumbs = () => {
    const path = location.pathname
    const items = [{ title: <Link to="/">Início</Link> }]

    if (path === '/workspace') {
      items.push({ title: 'Meus métodos' })
    } else if (path.startsWith('/workspace/method/')) {
      const match = path.match(/\/workspace\/method\/(\d+)/)
      const id = match ? match[1] : ''

      items.push({ title: <Link to="/workspace">Meus métodos</Link> })

      if (path.endsWith('/audit-log')) {
        items.push({ title: <Link to={`/workspace/method/${id}`}>Método (BRA-2026-{id})</Link> })
        items.push({ title: 'Auditoria' })
      } else {
        items.push({ title: `Método (BRA-2026-${id})` })
      }
    } else if (path === '/tasks') {
      items.push({ title: 'Kanban' })
    }

    return items
  }

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
      <Header />
      <Layout style={{ overflow: 'hidden' }}>
        {user && <Sidebar collapsed={collapsed} />}
        <Content style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden'
        }}>
          {user && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 24px',
              borderBottom: '1px solid #d9d9d9',
              backgroundColor: '#efefef',
            }}>
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  fontSize: '16px',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              />
              <Divider type="vertical" style={{ height: '20px', margin: '0 12px', borderColor: '#d9d9d9' }} />
              <Breadcrumb items={getBreadcrumbs()} />
            </div>
          )}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

