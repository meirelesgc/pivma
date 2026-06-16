import { useState } from 'react'
import { Typography, Input, Button, Flex, Card, Tag, Divider, Empty, Spin, Modal, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useProcesses } from '../hooks/useProcesses'
import { useAuth } from '../hooks/useAuth'
import { useUsers } from '../hooks/useUsers'

const { Title, Text } = Typography

export function WorkspacePage() {
  const { user: currentUser } = useAuth()
  const { data: users = [] } = useUsers()
  const {
    availableProcesses = [],
    processInstances = [],
    processInstanceRoles = [],
    isLoadingAvailable,
    isLoadingInstances,
    isLoadingRoles,
    createProcessInstance,
  } = useProcesses()

  const navigate = useNavigate()
  const [searchText, setSearchText] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProcessId, setSelectedProcessId] = useState(null)
  const [isCreating, setIsCreating] = useState(false)

  // Função para formatar a data de criação
  const formatDate = (isoString) => {
    if (!isoString) return '-'
    const date = new Date(isoString)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Cruza dados das instâncias com processos disponíveis, usuários e cargos para montar os cartões
  const cardData = processInstances.map((instance) => {
    const process = availableProcesses.find((p) => p.id === instance.process_id)
    const creator = users.find((u) => u.id === instance.created_by)
    const userRoleObj = processInstanceRoles.find(
      (r) => r.instance_id === instance.id && r.user_id === currentUser?.id
    )

    return {
      key: instance.id,
      id: instance.id,
      formattedId: `BRA-2026-${instance.id}`,
      processName: process ? process.name : `Processo #${instance.process_id}`,
      creatorName: creator ? creator.name : `Usuário #${instance.created_by}`,
      createdAt: instance.createdAt,
      myRole: userRoleObj ? userRoleObj.role : null,
    }
  })

  // Filtra os dados com base no texto de busca e exibe apenas onde o usuário logado está presente (possui papel)
  const filteredData = cardData.filter((item) => {
    if (!item.myRole) return false

    const searchLower = searchText.toLowerCase()
    return (
      item.processName.toLowerCase().includes(searchLower) ||
      item.creatorName.toLowerCase().includes(searchLower) ||
      item.formattedId.toLowerCase().includes(searchLower)
    )
  })

  // Abre o modal de criação e pré-seleciona a primeira opção
  const handleOpenModal = () => {
    if (availableProcesses.length > 0) {
      setSelectedProcessId(availableProcesses[0].id)
    } else {
      setSelectedProcessId(null)
    }
    setIsModalOpen(true)
  }

  // Confirma a criação do processo
  const handleConfirmCreate = () => {
    if (!currentUser) {
      message.error('Você precisa estar logado para criar um método.')
      return
    }
    if (!selectedProcessId) {
      message.error('Por favor, selecione um tipo de processo.')
      return
    }

    setIsCreating(true)
    createProcessInstance(
      {
        process_id: Number(selectedProcessId),
        created_by: currentUser.id,
      },
      {
        onSuccess: (data) => {
          message.success('Instância do método criada com sucesso!')
          setIsModalOpen(false)
          setSelectedProcessId(null)
          setIsCreating(false)
          // Redireciona para a página do método recém-criado
          navigate(`/workspace/method/${data.id}`)
        },
        onError: () => {
          message.error('Erro ao criar a instância do método.')
          setIsCreating(false)
        },
      }
    )
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Primeira linha: Titulo | Barra de busca | Novo método */}
      <Flex justify="space-between" align="center" style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}>Meus métodos</Title>
        <Flex gap={16} align="center">
          <Input.Search
            placeholder="Buscar métodos..."
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleOpenModal}
            loading={isLoadingAvailable}
          >
            Novo método
          </Button>
        </Flex>
      </Flex>

      {/* Segunda linha: Grid de Cards das instâncias criadas */}
      {isLoadingInstances || isLoadingAvailable || isLoadingRoles ? (
        <Flex justify="center" align="center" style={{ minHeight: '200px' }}>
          <Spin size="large" />
        </Flex>
      ) : filteredData.length === 0 ? (
        <Empty description="Nenhum método instanciado ainda." style={{ marginTop: '48px' }} />
      ) : (
        <Flex wrap="wrap" gap={16}>
          {filteredData.map((item) => (
            <Card
              key={item.key}
              hoverable
              style={{
                width: 'calc(33.33% - 11px)',
                minWidth: '300px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                border: '1px solid #f0f0f0',
              }}
              onClick={() => navigate(`/workspace/method/${item.id}`)}
            >
              <Flex vertical gap={12}>
                <Flex justify="space-between" align="center">
                  <Tag color="processing" style={{ fontWeight: '500', fontSize: '13px', borderRadius: '6px' }}>
                    {item.formattedId}
                  </Tag>
                  {item.myRole && (
                    <Tag color="gold" style={{ fontWeight: '500', fontSize: '12px', borderRadius: '6px' }}>
                      {item.myRole}
                    </Tag>
                  )}
                </Flex>

                <div>
                  <Text type="secondary" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Tipo do Processo
                  </Text>
                  <Title level={4} style={{ margin: '2px 0 0 0', fontSize: '16px' }}>
                    {item.processName}
                  </Title>
                </div>

                <Divider style={{ margin: '8px 0' }} />

                <Flex vertical gap={4}>
                  <Flex justify="space-between" align="center">
                    <Text type="secondary" style={{ fontSize: '13px' }}>Criador</Text>
                    <Text strong style={{ fontSize: '13px' }}>{item.creatorName}</Text>
                  </Flex>
                  <Flex justify="space-between" align="center">
                    <Text type="secondary" style={{ fontSize: '13px' }}>Criado em</Text>
                    <Text style={{ fontSize: '13px', color: '#595959' }}>{formatDate(item.createdAt)}</Text>
                  </Flex>
                </Flex>
              </Flex>
            </Card>
          ))}
        </Flex>
      )}

      {/* Modal para Escolher o Tipo do Processo */}
      <Modal
        title="Criar Novo Método"
        open={isModalOpen}
        onOk={handleConfirmCreate}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={isCreating}
        okText="Criar"
        cancelText="Cancelar"
      >
        <div style={{ paddingTop: '16px' }}>
          <p style={{ color: '#595959', marginBottom: '16px' }}>
            Selecione o tipo de processo para a criação do novo método de inspeção:
          </p>
          <Flex vertical gap={12}>
            {availableProcesses.map((process) => {
              const isSelected = selectedProcessId === process.id
              return (
                <div
                  key={process.id}
                  onClick={() => setSelectedProcessId(process.id)}
                  style={{
                    padding: '16px',
                    border: isSelected ? '2px solid #1677ff' : '1px solid #f0f0f0',
                    backgroundColor: isSelected ? '#e6f4ff' : '#fafafa',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      border: isSelected ? '5px solid #1677ff' : '2px solid #d9d9d9',
                      backgroundColor: '#fff',
                      transition: 'all 0.2s',
                    }}
                  />
                  <Flex vertical>
                    <Text
                      strong
                      style={{
                        fontSize: '14px',
                        color: isSelected ? '#0958d9' : '#262626',
                      }}
                    >
                      {process.name}
                    </Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Processo de validação de ativos tipo #{process.id}
                    </Text>
                  </Flex>
                </div>
              )
            })}
          </Flex>
        </div>
      </Modal>
    </div>
  )
}

