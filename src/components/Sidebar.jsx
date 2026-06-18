import { Layout, Button, Typography, Divider, Avatar, Flex, Spin } from 'antd'
import {
  UserOutlined,
  LogoutOutlined,
  FileTextOutlined,
  ProjectOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  AuditOutlined,
  LockOutlined,
  CheckOutlined
} from '@ant-design/icons'
import { useAuth } from '../hooks/useAuth'
import { useNavigate, useLocation } from 'react-router-dom'
import { useProcesses } from '../hooks/useProcesses'

const { Sider } = Layout
const { Text } = Typography

const iconMap = {
  'file-text': <FileTextOutlined />,
  'calendar': <CalendarOutlined />,
  'check-circle': <CheckCircleOutlined />,
  'gavel': <AuditOutlined />,
}

const UserProfile = ({ user, logout }) => {
  if (!user) return null

  return (
    <Flex vertical gap={12}>
      <Divider style={{ margin: 0 }} />
      <Flex align="center" gap={8}>
        <Avatar
          icon={<UserOutlined />}
          style={{ backgroundColor: '#1677ff' }}
        />
        <Text strong ellipsis style={{ maxWidth: 140 }}>
          {user.name}
        </Text>
      </Flex>
      <Text type="secondary" style={{ fontSize: 12, wordBreak: 'break-all' }}>
        {user.email}
      </Text>
      <Button
        type="primary"
        danger
        ghost
        icon={<LogoutOutlined />}
        onClick={logout}
        block
      >
        Sair da conta
      </Button>
    </Flex>
  )
}

const NavigationMenu = ({ menuItems, currentPath, onNavigate }) => (
  <Flex vertical gap={4}>
    {menuItems.map((item) => {
      const isActive = currentPath === item.path
      return (
        <Button
          key={item.path}
          type={isActive ? 'primary' : 'text'}
          icon={item.icon}
          onClick={() => onNavigate(item.path)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            width: '100%',
            textAlign: 'left',
          }}
        >
          {item.label}
        </Button>
      )
    })}
  </Flex>
)

const StepItem = ({ step, isCompleted, isActive, prevCompleted }) => {
  let iconComponent = iconMap[step.icone] || <FileTextOutlined />

  if (isCompleted) {
    iconComponent = <CheckOutlined />
  } else if (!prevCompleted) {
    iconComponent = <LockOutlined />
  }

  let badgeBgColor = '#fafafa'
  let badgeBorderColor = '#d9d9d9'
  let iconColor = '#8c8c8c'
  let textColor = '#8c8c8c'
  let fontWeight = 'normal'

  if (isCompleted) {
    badgeBgColor = '#f6ffed'
    badgeBorderColor = '#b7eb8f'
    iconColor = '#52c41a'
    textColor = '#595959'
  } else if (isActive) {
    badgeBgColor = '#e6f4ff'
    badgeBorderColor = '#91caff'
    iconColor = '#1677ff'
    textColor = '#262626'
    fontWeight = '600'
  }

  return (
    <Flex
      align="center"
      gap={12}
      style={{
        zIndex: 1,
        transition: 'all 0.2s',
      }}
    >
      <div
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          backgroundColor: badgeBgColor,
          border: `1.5px solid ${badgeBorderColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: iconColor,
          fontSize: '13px',
          transition: 'all 0.2s',
          boxShadow: isActive ? '0 0 0 2px rgba(22, 119, 255, 0.1)' : 'none',
        }}
      >
        {iconComponent}
      </div>

      <Flex vertical style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: '11px',
            color: textColor,
            fontWeight: fontWeight,
            transition: 'all 0.2s',
            lineHeight: '1.2',
          }}
        >
          {step.name}
        </Text>
      </Flex>
    </Flex>
  )
}

const TimelineSteps = ({ instanceId, processInstances, processSteps, processInstanceSteps }) => {
  const instance = processInstances.find(inst => inst.id === instanceId)
  if (!instance) return null

  const steps = processSteps
    .filter(step => step.process_id === instance.process_id)
    .sort((a, b) => a.sequence - b.sequence)

  if (steps.length === 0) return null

  const instanceStepsForThisInstance = processInstanceSteps.filter(
    s => s.process_instance_id === instanceId
  )

  return (
    <Flex vertical gap={14} style={{ paddingLeft: '8px', position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          left: '21px',
          top: '12px',
          bottom: '12px',
          width: '2px',
          backgroundColor: '#f0f0f0',
          zIndex: 0,
        }}
      />

      {steps.map((step, index) => {
        const instStep = instanceStepsForThisInstance.find(s => s.step_id === step.id)
        const isCompleted = instStep ? instStep.is_completed : false
        const isFirst = index === 0
        const prevCompleted =
          isFirst ||
          (instanceStepsForThisInstance.find(
            s => s.step_id === steps[index - 1].id
          )?.is_completed ?? false)

        const isActive = !isCompleted && prevCompleted

        return (
          <StepItem
            key={step.id}
            step={step}
            isCompleted={isCompleted}
            isActive={isActive}
            prevCompleted={prevCompleted}
          />
        )
      })}
    </Flex>
  )
}

const ProcessTimeline = ({ instanceId, processInstances, processSteps, processInstanceSteps, isLoading }) => {
  if (!instanceId) return null

  return (
    <Flex vertical gap={12} style={{ marginTop: '8px' }}>
      <Divider style={{ margin: '8px 0' }} />
      <Text strong type="secondary" style={{ fontSize: '11px', paddingLeft: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Fluxo do processo
      </Text>

      {isLoading ? (
        <Flex justify="center" align="center" style={{ padding: '16px 0' }}>
          <Spin size="small" />
        </Flex>
      ) : (
        <TimelineSteps
          instanceId={instanceId}
          processInstances={processInstances}
          processSteps={processSteps}
          processInstanceSteps={processInstanceSteps}
        />
      )}
    </Flex>
  )
}

export function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const {
    processInstances = [],
    processSteps = [],
    processInstanceSteps = [],
    isLoadingInstances,
    isLoadingSteps,
    isLoadingInstanceSteps
  } = useProcesses()

  const match = location.pathname.match(/\/workspace\/method\/(\d+)/)
  const instanceId = match ? Number(match[1]) : null

  const menuItems = [
    { label: 'Meus métodos', path: '/workspace', icon: <FileTextOutlined /> },
    { label: 'Kanban', path: '/tasks', icon: <ProjectOutlined /> },
  ]

  const methodMenuItems = instanceId ? [
    { label: 'Tarefas do Método', path: `/workspace/method/${instanceId}`, icon: <ProjectOutlined /> },
    { label: 'Auditoria', path: `/workspace/method/${instanceId}/audit-log`, icon: <AuditOutlined /> },
  ] : []

  const isTimelineLoading = isLoadingSteps || isLoadingInstanceSteps || isLoadingInstances

  return (
    <Sider width={220} theme="light" style={{ backgroundColor: '#efefef', borderRight: '1px solid #d9d9d9' }}>
      <Flex vertical justify="space-between" style={{ height: '100%', padding: '24px 16px' }}>
        <Flex vertical gap={24} style={{ overflowY: 'auto', flex: 1, paddingRight: '4px', marginBottom: '16px' }}>
          <Text strong style={{ fontSize: '16px', paddingLeft: '8px' }}>Área de trabalho</Text>

          <NavigationMenu
            menuItems={menuItems}
            currentPath={location.pathname}
            onNavigate={navigate}
          />

          {instanceId && (
            <Flex vertical gap={4}>
              <Divider style={{ margin: '8px 0' }} />
              <Text strong type="secondary" style={{ fontSize: '11px', paddingLeft: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Opções do Método
              </Text>
              <NavigationMenu
                menuItems={methodMenuItems}
                currentPath={location.pathname}
                onNavigate={navigate}
              />
            </Flex>
          )}

          <ProcessTimeline
            instanceId={instanceId}
            processInstances={processInstances}
            processSteps={processSteps}
            processInstanceSteps={processInstanceSteps}
            isLoading={isTimelineLoading}
          />
        </Flex>

        <UserProfile user={user} logout={logout} />
      </Flex>
    </Sider>
  )
}