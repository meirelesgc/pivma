import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useProcessTypes, useCreateProcess } from '../hooks/useProcesses'
import {
  Typography,
  Button,
  Card,
  Flex,
  Radio,
  Space,
  Input,
  message
} from 'antd'
import { ArrowLeftOutlined, RocketOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

export function NewSubmissionPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: processTypes, isLoading: isLoadingTypes } = useProcessTypes()
  const createMutation = useCreateProcess()

  const [selectedTypeId, setSelectedTypeId] = useState(null)
  const [title, setTitle] = useState('')

  const handleCreate = () => {
    if (!selectedTypeId) {
      message.warning('Por favor, selecione um tipo de processo.')
      return
    }

    if (!title.trim()) {
      message.warning('Por favor, informe um título para sua submissão.')
      return
    }

    createMutation.mutate(
      {
        processTypeId: selectedTypeId,
        userId: user.id,
        title: title.trim()
      },
      {
        onSuccess: (newProcess) => {
          message.success('Processo criado com sucesso!')
          navigate(`/workspace/processes/${newProcess.id}`)
        },
        onError: () => {
          message.error('Erro ao criar processo. Tente novamente.')
        }
      }
    )
  }

  return (
    <main className="workspace-content fade-in" style={{ maxWidth: '800px' }}>
      <Flex vertical gap={32}>
        <header>
          <Space direction="vertical" size={4}>
            <Title level={2} style={{ margin: 0, fontFamily: "var(--font-accent)" }}>
              Nova Submissão
            </Title>
            <Text type="secondary">
              Selecione o tipo de método que deseja submeter para validação.
            </Text>
          </Space>
        </header>

        <Card bordered={false} className="modern-card">
          <Flex vertical gap={24}>
            <div>
              <Text strong style={{ display: 'block', marginBottom: '12px' }}>
                1. Título da Submissão
              </Text>
              <Input
                placeholder="Ex: Validação do Método de Toxicidade Dérmica In Vitro"
                size="large"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ borderRadius: 'var(--radius-m)' }}
              />
            </div>

            <div>
              <Text strong style={{ display: 'block', marginBottom: '12px' }}>
                2. Tipo de Processo
              </Text>
              {isLoadingTypes ? (
                <Text type="secondary">Carregando tipos...</Text>
              ) : (
                <Radio.Group
                  onChange={(e) => setSelectedTypeId(e.target.value)}
                  value={selectedTypeId}
                  style={{ width: '100%' }}
                >
                  <Flex vertical gap={12}>
                    {processTypes?.map((type) => (
                      <Radio.Button
                        key={type.id}
                        value={type.id}
                        style={{
                          width: '100%',
                          height: 'auto',
                          padding: '16px',
                          borderRadius: 'var(--radius-m)',
                          border: '1px solid var(--border-color)',
                          textAlign: 'left',
                          lineHeight: '1.4'
                        }}
                      >
                        <Flex vertical>
                          <Text strong>{type.name}</Text>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {type.description}
                          </Text>
                        </Flex>
                      </Radio.Button>
                    ))}
                  </Flex>
                </Radio.Group>
              )}
            </div>

            <Flex justify="flex-end" gap={12} style={{ marginTop: '12px' }}>
              <Button
                size="large"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/workspace')}
                style={{ borderRadius: 'var(--radius-m)' }}
              >
                Cancelar
              </Button>
              <Button
                type="primary"
                size="large"
                icon={<RocketOutlined />}
                loading={createMutation.isPending}
                onClick={handleCreate}
                style={{ borderRadius: 'var(--radius-m)', padding: '0 32px' }}
              >
                Iniciar Submissão
              </Button>
            </Flex>
          </Flex>
        </Card>
      </Flex>
    </main>
  )
}
