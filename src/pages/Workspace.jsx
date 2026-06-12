import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useProcesses, useCreateProcess } from '../hooks/useProcesses'
import {
  Typography,
  Tag,
  Space,
  Button,
  Empty,
  Skeleton,
  Input,
  Card,
  Flex,
  Row,
  Col
} from 'antd'
import { SearchOutlined, PlusOutlined, FieldTimeOutlined } from '@ant-design/icons'
import './Workspace.css'

const { Title, Text } = Typography

const ProcessCard = ({ process, onClick }) => {
  const statusColor = process.status === 'active' ? 'success' : 'warning'
  const statusText = process.status === 'active' ? 'Em andamento' : process.status

  return (
    <Card
      hoverable
      className="modern-card"
      onClick={() => onClick(process.id)}
      styles={{ body: { padding: '24px' } }}
      bordered={false}
    >
      <Flex justify="space-between" align="flex-start">
        <Text className="process-role">{process.user_role}</Text>
        <Tag color={statusColor} style={{ borderRadius: 'var(--radius-pill)', margin: 0 }}>
          {statusText}
        </Tag>
      </Flex>

      <Flex vertical gap={4} style={{ margin: '16px 0' }}>
        <Title level={5} style={{ margin: 0, fontWeight: 'var(--weight-semibold)' }}>
          {process.title}
        </Title>
        <Space size={6} align="center">
          <Text type="secondary" style={{ fontSize: 'var(--font-size-smaller)' }}>
            {process.type_name}
          </Text>
          <Text type="secondary" style={{ fontSize: 'var(--font-size-smaller)' }}>•</Text>
          <Tag color="processing" style={{ borderRadius: 'var(--radius-pill)', padding: '0 8px', fontSize: '10px', margin: 0 }}>
            {process.current_node_name}
          </Tag>
        </Space>
      </Flex>

      <Flex justify="space-between" align="center" className="process-footer">
        <Text type="tertiary" style={{ fontSize: '11px' }}>ID: {process.id}</Text>
        <Space size={4}>
          <FieldTimeOutlined style={{ fontSize: '11px', color: 'var(--text-tertiary)' }} />
          <Text type="tertiary" style={{ fontSize: '11px' }}>
            {new Date(process.updated_at).toLocaleDateString()}
          </Text>
        </Space>
      </Flex>
    </Card>
  )
}

export function WorkspacePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: processes, isLoading } = useProcesses(user?.id)
  const createMutation = useCreateProcess()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredProcesses = processes?.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toString().includes(searchTerm)
  )

  const handleCreateProcess = () => {
    navigate('/workspace/new-submission')
  }

  const handleCardClick = (id) => {
    navigate(`/workspace/processes/${id}`)
  }
  return (
    <main className="workspace-content fade-in" style={{ padding: '24px', maxWidth: '100%', overflowX: 'hidden' }}>
      <Flex justify="space-between" align="center" className="content-top-bar" style={{ marginBottom: 20 }}>
        <Space align="center" size={32}>
          <Title level={2} style={{ margin: 0, fontFamily: "var(--font-accent)" }}>
            Meus Métodos
          </Title>
          <Input
            placeholder="Buscar por nome ou ID..."
            prefix={<SearchOutlined style={{ color: 'var(--text-tertiary)' }} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="filled"
            style={{
              borderRadius: 'var(--radius-pill)',
              width: '300px',
              backgroundColor: 'var(--background-tertiary)',
              height: '40px'
            }}
          />
        </Space>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          loading={createMutation.isPending}
          onClick={handleCreateProcess}
          style={{
            borderRadius: 'var(--radius-l)',
            height: '44px',
            padding: '0 24px',
            fontSize: 'var(--font-size-medium)',
            fontWeight: 'var(--weight-medium)'
          }}
        >
          Nova Submissão
        </Button>
      </Flex>

      <div style={{ padding: '24px 0' }}>
        {isLoading ? (
          <Row gutter={[24, 24]}>
            {[1, 2, 3].map(i => (
              <Col xs={24} sm={12} lg={8} key={i}>
                <Skeleton active avatar paragraph={{ rows: 3 }} />
              </Col>
            ))}
          </Row>
        ) : filteredProcesses?.length > 0 ? (
          <Row gutter={[24, 24]}>
            {filteredProcesses.map(p => (
              <Col xs={24} sm={12} lg={8} key={p.id}>
                <ProcessCard
                  process={p}
                  onClick={handleCardClick}
                />
              </Col>
            ))}
          </Row>
        ) : (
          <Card className="modern-card" style={{ padding: '60px 0', textAlign: 'center' }} bordered={false}>
            <Empty
              description={
                <Space direction="vertical">
                  <Text type="secondary" style={{ fontSize: 'var(--font-size-medium)' }}>
                    Você ainda não possui métodos submetidos.
                  </Text>
                  <Text type="tertiary" style={{ fontSize: 'var(--font-size-smaller)' }}>
                    Clique em "Nova Submissão" para começar.
                  </Text>
                </Space>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button
                type="primary"
                style={{ borderRadius: 'var(--radius-m)' }}
                loading={createMutation.isPending}
                onClick={handleCreateProcess}
              >
                Iniciar Submissão
              </Button>
            </Empty>
          </Card>
        )}
      </div>
    </main>
  )
}