import React from 'react'
import { Layout, Menu, Typography, Avatar, Button, Flex } from 'antd'
import {
  AppstoreOutlined,
  LogoutOutlined,
  UserOutlined,
  CheckCircleFilled,
  PlayCircleFilled,
  ClockCircleOutlined,
  HistoryOutlined
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useProcessDetails } from '../hooks/useProcesses'

const { Sider } = Layout
const { Text } = Typography

const getStageIcon = (status) => {
  switch (status) {
    case 'completed':
      return <CheckCircleFilled style={{ color: '#16a34a', fontSize: '15px' }} />
    case 'active':
      return <PlayCircleFilled style={{ color: '#eab308', fontSize: '15px' }} />
    case 'pending':
    default:
      return <ClockCircleOutlined style={{ color: '#94a3b8', fontSize: '15px' }} />
  }
}

export function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  // Parse process ID from URL (e.g. /workspace/processes/ALT-2026-301)
  const match = location.pathname.match(/^\/workspace\/processes\/([^/]+)/)
  const processId = match ? match[1] : null

  const { data: process, isLoading } = useProcessDetails(processId)

  if (!user) return null

  const menuItems = [
    {
      key: 'platform-label',
      label: 'Plataforma',
      type: 'group',
      children: [
        {
          key: '/workspace',
          icon: <AppstoreOutlined />,
          label: 'Área de trabalho',
        },
      ],
    },
  ]

  if (processId) {
    if (isLoading) {
      menuItems.push({
        key: 'process-flow-label',
        label: 'Fluxo do processo',
        type: 'group',
        children: [
          {
            key: 'loading-stages',
            label: <Text type="secondary" style={{ fontSize: '12px' }}>Carregando fluxo...</Text>,
            style: { pointerEvents: 'none', cursor: 'default' }
          }
        ]
      })
    } else if (process?.stages) {
      menuItems.push({
        key: 'process-flow-label',
        label: 'Fluxo do processo',
        type: 'group',
        children: process.stages.map(stage => ({
          key: `stage-${stage.id}`,
          icon: getStageIcon(stage.status),
          label: (
            <Flex vertical style={{ lineHeight: '1.2', padding: '4px 0' }}>
              <Text 
                strong={stage.status === 'active'}
                style={{ 
                  fontSize: '13px',
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                  color: stage.status === 'active' 
                    ? 'var(--primary-color)' 
                    : stage.status === 'completed' 
                      ? 'var(--text-color)' 
                      : '#64748b'
                }}
              >
                {stage.name}
              </Text>
              <Text 
                type="secondary" 
                style={{ 
                  fontSize: '11px',
                  color: stage.status === 'completed' 
                    ? '#16a34a' 
                    : stage.status === 'active' 
                      ? '#d48806' 
                      : '#94a3b8'
                }}
              >
                {stage.status === 'completed' 
                  ? 'Concluído' 
                  : stage.status === 'active' 
                    ? 'Em andamento' 
                    : 'Pendente'}
              </Text>
            </Flex>
          ),
          style: { 
            height: 'auto', 
            margin: '4px 0',
            cursor: 'default',
            pointerEvents: 'none'
          }
        }))
      })
    }

    // Add Resources group
    menuItems.push({
      key: 'resources-label',
      label: 'Recursos',
      type: 'group',
      children: [
        {
          key: `/workspace/processes/${processId}/participants`,
          icon: <UserOutlined />,
          label: 'Participantes',
        },
        {
          key: `/workspace/processes/${processId}/history`,
          icon: <HistoryOutlined />,
          label: 'Histórico',
        }
      ]
    })
  }

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
          onClick={({ key }) => {
            if (key.startsWith('/')) {
              navigate(key)
            }
          }}
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
            Sair da Conta
          </Button>
        </div>
      </Flex>
    </Sider>
  )
}
