import { useState } from 'react'
import { Select, Input, Button, List, Space, Alert, Tag, Radio, Typography } from 'antd'
import { UserAddOutlined, DeleteOutlined, MailOutlined, UserOutlined, CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { useAuth } from '../../../hooks/useAuth'
import { useUsers } from '../../../hooks/useUsers'
import { useProcesses } from '../../../hooks/useProcesses'

const { Text, Title, Paragraph } = Typography

export function AssignmentTask({ task, onToggle }) {
  const { user: currentUser } = useAuth()
  const { data: users = [] } = useUsers()
  const {
    processInstanceRoles = [],
    processInstanceTasks = [],
    pendingInvites = [],
    completeAssignmentTaskAsync
  } = useProcesses()

  const [assignmentType, setAssignmentType] = useState('registered')
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [emailInput, setEmailInput] = useState('')
  const [tempAssignments, setTempAssignments] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 1. Verificar dependência sequencial
  const stepTasks = processInstanceTasks
    .filter(t => t.process_instance_step_id === task.process_instance_step_id)
    .sort((a, b) => a.id - b.id)
  
  const currentIndex = stepTasks.findIndex(t => t.id === task.id)
  const isBlocked = currentIndex > 0 && stepTasks.slice(0, currentIndex).some(t => !t.is_completed)

  // 2. Verificar se o usuário atual possui o papel responsável
  const userRoles = processInstanceRoles
    .filter(r => r.instance_id === task.process_instance_id && r.user_id === currentUser?.id)
    .map(r => r.role)
  const canExecute = userRoles.includes(task.role)

  // 3. Obter atribuições e convites já persistidos para esta tarefa/cargo
  const existingAssignments = processInstanceRoles
    .filter(r => r.instance_id === task.process_instance_id && r.role === task.target_role)
    .map(r => {
      const u = users.find(user => user.id === r.user_id)
      return {
        id: r.id,
        name: u ? u.name : `Usuário #${r.user_id}`,
        email: u ? u.email : '-',
        isPending: false
      }
    })

  const existingPendingInvites = pendingInvites
    .filter(i => i.process_instance_id === task.process_instance_id && i.target_role === task.target_role && i.status === 'sent')
    .map(i => ({
      id: i.id,
      name: i.email,
      email: i.email,
      isPending: true
    }))

  const allSavedAssignments = [...existingAssignments, ...existingPendingInvites]

  const handleAddTemp = () => {
    if (assignmentType === 'registered') {
      if (!selectedUserId) return
      const user = users.find(u => u.id === selectedUserId)
      if (!user) return

      // Evita duplicados na lista temporária ou salvos
      if (tempAssignments.some(a => a.userId === user.id) || processInstanceRoles.some(r => r.instance_id === task.process_instance_id && r.user_id === user.id && r.role === task.target_role)) {
        return
      }

      setTempAssignments(prev => [...prev, { userId: user.id, name: user.name, email: user.email }])
      setSelectedUserId(null)
    } else {
      const email = emailInput.trim()
      if (!email || !email.includes('@')) return

      if (tempAssignments.some(a => a.email?.toLowerCase() === email.toLowerCase()) || allSavedAssignments.some(a => a.email.toLowerCase() === email.toLowerCase())) {
        return
      }

      setTempAssignments(prev => [...prev, { email, name: email }])
      setEmailInput('')
    }
  }

  const handleRemoveTemp = (index) => {
    setTempAssignments(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (tempAssignments.length === 0) return
    setIsSubmitting(true)
    try {
      await completeAssignmentTaskAsync({
        taskInstanceId: task.id,
        assignments: tempAssignments
      })
      setTempAssignments([])
      if (onToggle) onToggle()
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isBlocked) {
    return (
      <Alert
        message="Tarefa Bloqueada"
        description="Esta tarefa depende da conclusão das atribuições anteriores na sequência do fluxo de Planejamento."
        type="warning"
        showIcon
        icon={<InfoCircleOutlined />}
        style={{ borderRadius: '12px' }}
      />
    )
  }

  if (task.is_completed) {
    return (
      <div style={{ padding: '12px 0' }}>
        <Alert
          message="Atribuição Concluída"
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
          style={{ borderRadius: '12px', marginBottom: '16px' }}
        />
        <Title level={5} style={{ fontFamily: 'Barlow, sans-serif', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#8c8c8c' }}>
          Pessoas Atribuídas ao Cargo de "{task.target_role}":
        </Title>
        <List
          size="small"
          bordered
          dataSource={allSavedAssignments}
          renderItem={item => (
            <List.Item style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Space>
                {item.isPending ? <MailOutlined style={{ color: '#fa8c16' }} /> : <UserOutlined style={{ color: '#52c41a' }} />}
                <Text strong>{item.name}</Text>
                <Text type="secondary">({item.email})</Text>
              </Space>
              {item.isPending ? (
                <Tag color="warning" style={{ borderRadius: '4px' }}>Convite Pendente</Tag>
              ) : (
                <Tag color="success" style={{ borderRadius: '4px' }}>Ativo</Tag>
              )}
            </List.Item>
          )}
          style={{ borderRadius: '12px', backgroundColor: '#fafafa' }}
        />
      </div>
    )
  }

  if (!canExecute) {
    return (
      <Alert
        message="Acesso Restrito"
        description={`Apenas usuários associados ao papel de "${task.role}" na instância podem realizar esta atribuição.`}
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        style={{ borderRadius: '12px' }}
      />
    )
  }

  // Filtrar usuários para o Select (excluir os que já estão vinculados)
  const availableUsers = users.filter(u => 
    !allSavedAssignments.some(a => a.email.toLowerCase() === u.email.toLowerCase()) &&
    !tempAssignments.some(t => t.userId === u.id)
  )

  return (
    <Space direction="vertical" size={20} style={{ width: '100%' }}>
      <Paragraph style={{ fontFamily: 'Lexend, sans-serif', margin: 0, color: '#595959' }}>
        Você deve definir a(s) pessoa(s) para o cargo de <strong>{task.target_role}</strong>. Você pode selecionar um usuário já existente no sistema ou informar um e-mail para enviar um convite de cadastro.
      </Paragraph>

      {allSavedAssignments.length > 0 && (
        <div>
          <Title level={5} style={{ fontFamily: 'Barlow, sans-serif', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#8c8c8c', marginBottom: '8px' }}>
            Já Atribuídos:
          </Title>
          <List
            size="small"
            dataSource={allSavedAssignments}
            renderItem={item => (
              <List.Item style={{ padding: '6px 12px' }}>
                <Space>
                  {item.isPending ? <MailOutlined style={{ color: '#fa8c16' }} /> : <UserOutlined style={{ color: '#1890ff' }} />}
                  <Text strong>{item.name}</Text>
                  {item.isPending && <Tag color="warning" style={{ fontSize: '10px', borderRadius: '4px' }}>Convite Pendente</Tag>}
                </Space>
              </List.Item>
            )}
            style={{ borderRadius: '8px', border: '1px solid #f0f0f0', backgroundColor: '#fafafa' }}
          />
        </div>
      )}

      <div style={{ padding: '16px', border: '1.5px dashed #d9d9d9', borderRadius: '12px', backgroundColor: '#fff' }}>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Radio.Group value={assignmentType} onChange={e => setAssignmentType(e.target.value)} size="middle">
            <Radio.Button value="registered" style={{ borderRadius: '6px 0 0 6px' }}>Usuário Cadastrado</Radio.Button>
            <Radio.Button value="email" style={{ borderRadius: '0 6px 6px 0' }}>Convidar por E-mail</Radio.Button>
          </Radio.Group>

          {assignmentType === 'registered' ? (
            <Select
              showSearch
              placeholder="Pesquise por nome ou e-mail..."
              optionFilterProp="children"
              value={selectedUserId}
              onChange={val => setSelectedUserId(val)}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={availableUsers.map(u => ({
                value: u.id,
                label: `${u.name} (${u.email})`
              }))}
              style={{ width: '100%' }}
            />
          ) : (
            <Input
              placeholder="Digite o e-mail da pessoa..."
              prefix={<MailOutlined />}
              value={emailInput}
              onChange={e => setEmailInput(e.target.value)}
            />
          )}

          <Button
            type="dashed"
            icon={<UserAddOutlined />}
            onClick={handleAddTemp}
            disabled={assignmentType === 'registered' ? !selectedUserId : !emailInput.trim()}
            block
            style={{ borderRadius: '8px', fontWeight: '500' }}
          >
            Adicionar à lista
          </Button>
        </Space>
      </div>

      {tempAssignments.length > 0 && (
        <div>
          <Title level={5} style={{ fontFamily: 'Barlow, sans-serif', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#8c8c8c', marginBottom: '8px' }}>
            Novas atribuições a serem salvas:
          </Title>
          <List
            size="small"
            bordered
            dataSource={tempAssignments}
            renderItem={(item, index) => (
              <List.Item
                actions={[
                  <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleRemoveTemp(index)} />
                ]}
              >
                <Space>
                  {item.userId ? <UserOutlined style={{ color: '#52c41a' }} /> : <MailOutlined style={{ color: '#fa8c16' }} />}
                  <Text>{item.name} {item.userId ? '' : '(Novo Usuário)'}</Text>
                </Space>
              </List.Item>
            )}
            style={{ borderRadius: '8px', backgroundColor: '#f9f9f9' }}
          />

          <Button
            type="primary"
            onClick={handleSave}
            loading={isSubmitting}
            block
            style={{
              fontFamily: 'Lexend, sans-serif',
              borderRadius: '8px',
              fontWeight: '600',
              marginTop: '16px',
              backgroundColor: '#52c41a',
              borderColor: '#52c41a'
            }}
          >
            Confirmar e Concluir Atribuição
          </Button>
        </div>
      )}
    </Space>
  )
}
