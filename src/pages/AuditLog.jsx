import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Table, Typography, Tag, Input, Select, Space, Avatar, Button, Flex, Spin, Empty, Tooltip } from 'antd'
import { SearchOutlined, AuditOutlined, UserOutlined, CalendarOutlined, EnvironmentOutlined } from '@ant-design/icons'
import { useProcesses, useAuditLogs } from '../hooks/useProcesses'
import { ProcessInstanceHeader } from '../components/MethodDetails/ProcessInstanceHeader'

const { Title, Text, Paragraph } = Typography

const actionColors = {
  "Criar Método": "cyan",
  "Submeter Formulário": "blue",
  "Avaliação de IA": "purple",
  "Aprovar Revisão": "green",
  "Rejeitar Revisão": "red",
  "Atribuir Cargo": "orange",
  "Definir Amostras": "geekblue",
  "Definir Template de Coleta": "gold",
  "Remover Template de Coleta": "magenta",
  "Concluir Tarefa": "lime",
  "Reabrir Tarefa": "volcano"
}

export function AuditLogPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const instanceId = Number(id)

  const {
    processInstances,
    processSteps,
    processInstanceSteps,
    isLoadingInstances,
    isLoadingSteps,
    isLoadingInstanceSteps
  } = useProcesses()

  const { auditLogs, isLoadingAuditLogs } = useAuditLogs(instanceId)

  // Filters State
  const [searchText, setSearchText] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const [userFilter, setUserFilter] = useState('all')

  const instance = useMemo(() =>
    processInstances?.find(inst => inst.id === instanceId),
    [processInstances, instanceId])

  const steps = useMemo(() =>
    processSteps?.filter(step => step?.process_id === instance?.process_id)
      .sort((a, b) => a.sequence - b.sequence) || [],
    [processSteps, instance])

  const instSteps = useMemo(() =>
    processInstanceSteps?.filter(s => s.process_instance_id === instanceId) || [],
    [processInstanceSteps, instanceId])

  const overallProgress = useMemo(() => {
    const completed = instSteps.filter(s => s.is_completed).length
    return steps.length > 0 ? Math.round((completed / steps.length) * 100) : 0
  }, [instSteps, steps])

  // Extract unique action types and users for select options
  const uniqueActions = useMemo(() => {
    if (!auditLogs) return []
    return Array.from(new Set(auditLogs.map(log => log.action)))
  }, [auditLogs])

  const uniqueUsers = useMemo(() => {
    if (!auditLogs) return []
    const usersMap = new Map()
    auditLogs.forEach(log => {
      usersMap.set(log.user_email, log.user_name)
    })
    return Array.from(usersMap.entries()).map(([email, name]) => ({ email, name }))
  }, [auditLogs])

  // Filter logs
  const filteredLogs = useMemo(() => {
    if (!auditLogs) return []

    // Sort logs descending (most recent first)
    const sorted = [...auditLogs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

    return sorted.filter(log => {
      const matchSearch =
        log.description.toLowerCase().includes(searchText.toLowerCase()) ||
        log.user_name.toLowerCase().includes(searchText.toLowerCase()) ||
        log.where_context.toLowerCase().includes(searchText.toLowerCase())

      const matchAction = actionFilter === 'all' || log.action === actionFilter
      const matchUser = userFilter === 'all' || log.user_email === userFilter

      return matchSearch && matchAction && matchUser
    })
  }, [auditLogs, searchText, actionFilter, userFilter])

  const isLoading = isLoadingInstances || isLoadingSteps || isLoadingInstanceSteps || isLoadingAuditLogs

  if (isLoading) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: '400px' }}>
        <Spin size="large" tip="Carregando histórico de auditoria..." />
      </Flex>
    )
  }

  if (!instance) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Empty description="Método não encontrado." />
        <Button type="primary" onClick={() => navigate('/workspace')} style={{ marginTop: '16px' }}>
          Voltar para Workspace
        </Button>
      </div>
    )
  }

  const columns = [
    {
      title: 'Quem',
      key: 'user',
      width: '22%',
      render: (_, record) => {
        const isSystem = record.user_id === 0
        return (
          <Flex align="center" gap={8}>
            <Avatar
              icon={<UserOutlined />}
              style={{
                backgroundColor: isSystem ? '#722ed1' : '#1677ff',
                minWidth: '32px'
              }}
            />
            <Flex vertical>
              <Text strong style={{ fontSize: '13px' }}>{record.user_name}</Text>
              <Text type="secondary" style={{ fontSize: '11px' }}>{record.user_email}</Text>
            </Flex>
          </Flex>
        )
      }
    },
    {
      title: 'O quê',
      dataIndex: 'action',
      key: 'action',
      width: '18%',
      render: (action) => (
        <Tag color={actionColors[action] || 'default'} style={{ fontWeight: 500, borderRadius: '4px' }}>
          {action}
        </Tag>
      )
    },
    {
      title: 'Que etapa',
      dataIndex: 'where_context',
      key: 'where',
      width: '18%',
      render: (where) => (
        <Space size={4}>
          <EnvironmentOutlined style={{ color: '#8c8c8c' }} />
          <Text style={{ fontSize: '13px' }}>{where}</Text>
        </Space>
      )
    },
    {
      title: 'Descrição',
      dataIndex: 'description',
      key: 'description',
      width: '27%',
      render: (desc) => (
        <Tooltip title={desc} placement="topLeft">
          <Paragraph ellipsis={{ rows: 2 }} style={{ margin: 0, fontSize: '13px', lineHeight: '1.4' }}>
            {desc}
          </Paragraph>
        </Tooltip>
      )
    },
    {
      title: 'Quando',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: '15%',
      render: (time) => {
        const date = new Date(time)
        return (
          <Flex vertical>
            <Space size={4}>
              <CalendarOutlined style={{ color: '#8c8c8c', fontSize: '12px' }} />
              <Text style={{ fontSize: '13px' }}>
                {date.toLocaleDateString('pt-BR')}
              </Text>
            </Space>
            <Text type="secondary" style={{ fontSize: '11px', marginLeft: '16px' }}>
              {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </Flex>
        )
      }
    }
  ]

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <ProcessInstanceHeader
        instance={instance}
        overallProgress={overallProgress}
        onBack={() => navigate('/workspace')}
      />

      <Card
        style={{
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
          border: '1px solid #f0f0f0',
          marginBottom: '24px'
        }}
      >
        <Flex gap={12} align="center" style={{ marginBottom: '16px' }}>
          <AuditOutlined style={{ fontSize: '20px', color: '#1677ff' }} />
          <Title level={4} style={{ margin: 0, fontFamily: 'Barlow, sans-serif' }}>
            Histórico de Auditoria
          </Title>
        </Flex>

        <Paragraph type="secondary" style={{ fontFamily: 'Lexend, sans-serif', fontSize: '14px', marginBottom: '24px' }}>
          Rastreabilidade completa de todas as tarefas executadas nesta instância de validação de método alternativo. Veja quem executou, o que foi feito, onde, quando e por quê.
        </Paragraph>

        {/* Filtros */}
        <Flex gap={16} wrap="wrap" style={{ marginBottom: '20px' }}>
          <Input
            placeholder="Buscar por descrição, usuário ou etapa..."
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 320, borderRadius: '8px' }}
          />

          <Select
            value={actionFilter}
            onChange={setActionFilter}
            style={{ width: 220 }}
            dropdownStyle={{ borderRadius: '8px' }}
            options={[
              { value: 'all', label: 'Todas as Ações' },
              ...uniqueActions.map(action => ({ value: action, label: action }))
            ]}
          />

          <Select
            value={userFilter}
            onChange={setUserFilter}
            style={{ width: 250 }}
            dropdownStyle={{ borderRadius: '8px' }}
            options={[
              { value: 'all', label: 'Todos os Usuários' },
              ...uniqueUsers.map(u => ({ value: u.email, label: `${u.name} (${u.email})` }))
            ]}
          />

          {(searchText || actionFilter !== 'all' || userFilter !== 'all') && (
            <Button
              type="text"
              danger
              onClick={() => {
                setSearchText('')
                setActionFilter('all')
                setUserFilter('all')
              }}
              style={{ borderRadius: '8px' }}
            >
              Limpar Filtros
            </Button>
          )}
        </Flex>

        <Table
          dataSource={filteredLogs}
          columns={columns}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            style: { fontFamily: 'Lexend, sans-serif' }
          }}
          bordered
          style={{
            fontFamily: 'Lexend, sans-serif',
          }}
          rowClassName="audit-row"
        />
      </Card>
    </div>
  )
}
