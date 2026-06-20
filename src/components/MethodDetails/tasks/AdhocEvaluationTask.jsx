import { useState, useMemo } from 'react'
import { Card, Typography, Table, Tag, Input, Radio, Button, Space, Flex, Alert, Divider, Descriptions, Tooltip, Row, Col } from 'antd'
import { FilePdfOutlined, CheckCircleOutlined, InfoCircleOutlined, SafetyCertificateOutlined, EyeInvisibleOutlined } from '@ant-design/icons'
import { useAuth } from '../../../hooks/useAuth'
import { useProcesses, useAdhocOpinions, useSampleDefinitions, useDataTemplates } from '../../../hooks/useProcesses'

const { Title, Paragraph, Text } = Typography

export function AdhocEvaluationTask({ task }) {
  const instanceId = task.process_instance_id
  const { user: currentUser } = useAuth()
  const { processInstanceRoles = [] } = useProcesses()

  const { opinions = [], saveOpinion, isSavingOpinion } = useAdhocOpinions(instanceId)
  const { samples = [] } = useSampleDefinitions(instanceId)
  const { templates = [] } = useDataTemplates(instanceId)

  const [techObs, setTechObs] = useState('')
  const [decision, setDecision] = useState('')

  // Determine user role
  const userRoleObj = processInstanceRoles.find(
    r => r.instance_id === instanceId && r.user_id === currentUser?.id
  )
  const userRole = userRoleObj ? userRoleObj.role.toLowerCase() : ''
  const isAdhocSpecialist = userRole.includes('comitê adhoc') || userRole.includes('comite adhoc') || userRole.includes('especialistas')
  const isAdmin = currentUser?.system_role === 'admin'
  const isGestor = userRole.includes('grupo gestor')

  const canExecute = (isAdhocSpecialist || isAdmin) && !task.is_completed

  // Find opinion submitted by current user
  const myOpinion = useMemo(() => {
    return opinions.find(o => Number(o.user_id) === Number(currentUser?.id)) || opinions[0]
  }, [opinions, currentUser])

  // Blind mapping for laboratories
  // Replace real names with blind codenames
  const simulatedResults = [
    { key: '1', lab: 'Laboratório Cego #1', sampleCode: 'XR-3921-K', replicate: '1', value: '94.2%', sd: '1.2%', status: 'Válido' },
    { key: '2', lab: 'Laboratório Cego #1', sampleCode: 'XR-3921-K', replicate: '2', value: '93.8%', sd: '1.4%', status: 'Válido' },
    { key: '3', lab: 'Laboratório Cego #2', sampleCode: 'ZB-4820-L', replicate: '1', value: '92.1%', sd: '1.8%', status: 'Válido' },
    { key: '4', lab: 'Laboratório Cego #2', sampleCode: 'ZB-4820-L', replicate: '2', value: '93.5%', sd: '1.1%', status: 'Válido' },
    { key: '5', lab: 'Laboratório Cego #3', sampleCode: 'FT-5011-M', replicate: '1', value: '95.0%', sd: '0.9%', status: 'Válido' },
    { key: '6', lab: 'Laboratório Cego #3', sampleCode: 'FT-5011-M', replicate: '2', value: '94.8%', sd: '0.8%', status: 'Válido' },
  ]

  const resultsColumns = [
    { title: 'Laboratório (Cego)', dataIndex: 'lab', key: 'lab', render: (val) => <Text strong style={{ color: '#595959' }}>{val}</Text> },
    { title: 'Código Cego Amostra', dataIndex: 'sampleCode', key: 'sampleCode', render: (code) => <Tag color="blue">{code}</Tag> },
    { title: 'Réplica', dataIndex: 'replicate', key: 'replicate' },
    { title: 'Viabilidade Celular Média', dataIndex: 'value', key: 'value', render: (val) => <strong>{val}</strong> },
    { title: 'Desvio Padrão (SD)', dataIndex: 'sd', key: 'sd' },
    { title: 'Status do Ensaio', dataIndex: 'status', key: 'status', render: (s) => <Tag color="success">{s.toUpperCase()}</Tag> }
  ]

  const handleSubmitOpinion = () => {
    if (!techObs.trim()) {
      return
    }
    if (!decision) {
      return
    }
    saveOpinion({
      instanceId,
      opinion: {
        technical_observations: techObs,
        preliminary_decision: decision
      }
    })
  }

  const getDecisionTagColor = (dec) => {
    switch (dec) {
      case 'approved':
      case 'Aprovado':
        return 'success'
      case 'approved_with_restrictions':
      case 'Aprovado com restrições':
        return 'warning'
      case 'rejected':
      case 'Rejeitado':
        return 'error'
      case 'request_new_data':
      case 'Solicitar nova rodada de dados':
        return 'processing'
      default:
        return 'default'
    }
  }

  const getDecisionLabel = (dec) => {
    switch (dec) {
      case 'approved': return 'Aprovado'
      case 'approved_with_restrictions': return 'Aprovado com restrições'
      case 'rejected': return 'Rejeitado'
      case 'request_new_data': return 'Solicitar nova rodada de dados'
      default: return dec
    }
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%', fontFamily: 'Lexend, sans-serif' }}>

      {/* DOSSIÊ COMPLETO (MODALIDADE CEGA) */}
      <Card
        title={
          <Flex align="center" gap={8}>
            <EyeInvisibleOutlined style={{ color: '#025ECC' }} />
            <span style={{ fontFamily: 'Barlow, sans-serif', color: '#014E2A' }}>Dossiê Completo de Validação (Cego)</span>
          </Flex>
        }
        size="small"
        style={{ borderRadius: '20px', border: '1px solid #EFEFEF', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}
      >
        <Paragraph>
          Os dados abaixo representam a compilação cega dos resultados obtidos nos ensaios interlaboratoriais.
          As identidades dos laboratórios foram ofuscadas para garantir a imparcialidade dos avaliadores independentes.
        </Paragraph>

        <Divider orientation="left" style={{ margin: '12px 0' }}><Text strong style={{ fontSize: '13px' }}>1. Parâmetros Metodológicos Estabelecidos</Text></Divider>
        <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }} style={{ marginBottom: '16px' }}>
          <Descriptions.Item label="Nome do Método">Método In-Vitro de Viabilidade Epicutânea</Descriptions.Item>
          <Descriptions.Item label="Princípio Relevante">Princípio dos 3Rs (Substituição in-vivo por modelo celular)</Descriptions.Item>
          <Descriptions.Item label="Replicatas de Teste">3 réplicas técnicas</Descriptions.Item>
          <Descriptions.Item label="Concentração Máxima">100.0 μg/mL</Descriptions.Item>
          <Descriptions.Item label="Protocolo POP Original">
            <Button type="link" icon={<FilePdfOutlined />} size="small" style={{ color: '#025ECC', padding: 0 }}>
              pop_citotoxicidade_v1.pdf
            </Button>
          </Descriptions.Item>
          <Descriptions.Item label="Plano Estatístico Aprovado">
            <Button type="link" icon={<FilePdfOutlined />} size="small" style={{ color: '#025ECC', padding: 0 }}>
              plano_estatistico_aprovado.pdf
            </Button>
          </Descriptions.Item>
        </Descriptions>

        <Divider orientation="left" style={{ margin: '12px 0' }}><Text strong style={{ fontSize: '13px' }}>2. Resultados Consolidados dos Laboratórios</Text></Divider>
        <Table
          dataSource={simulatedResults}
          columns={resultsColumns}
          pagination={false}
          size="small"
          bordered
          style={{ marginBottom: '24px' }}
        />

      </Card>

      {/* PARECER TÉCNICO E DECISÃO PRELIMINAR */}
      <Card
        title={
          <Flex align="center" gap={8}>
            <SafetyCertificateOutlined style={{ color: '#014E2A' }} />
            <span style={{ fontFamily: 'Barlow, sans-serif', color: '#014E2A' }}>Emissão de Parecer Técnico Independente</span>
          </Flex>
        }
        size="small"
        style={{ borderRadius: '20px', border: '1px solid #EFEFEF', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}
      >
        {task.is_completed ? (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Alert
              message="Parecer Emitido com Sucesso"
              description="A sua avaliação técnica independente foi registrada no sistema. Os resultados estão salvos no histórico da validação e o Grupo Gestor foi notificado."
              type="success"
              showIcon
              icon={<CheckCircleOutlined />}
            />
            {myOpinion && (
              <Card style={{ backgroundColor: '#FAFAFA', borderRadius: '12px' }}>
                <Descriptions title="Parecer Registrado" size="small" column={1}>
                  <Descriptions.Item label="Avaliador">{myOpinion.user_name}</Descriptions.Item>
                  <Descriptions.Item label="Decisão Preliminar">
                    <Tag color={getDecisionTagColor(myOpinion.preliminary_decision)}>
                      {getDecisionLabel(myOpinion.preliminary_decision).toUpperCase()}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Observações Técnicas e Justificativas">
                    <div style={{ backgroundColor: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #EFEFEF', whiteSpace: 'pre-wrap' }}>
                      {myOpinion.technical_observations}
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item label="Data de Envio">
                    {new Date(myOpinion.createdAt).toLocaleString()}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}
          </Space>
        ) : (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {!canExecute && (
              <Alert
                message="Acesso Restrito"
                description={
                  isGestor
                    ? "Como membro do Grupo Gestor, você poderá visualizar o parecer assim que ele for emitido pelos especialistas do Comitê ADHOC."
                    : "Apenas membros designados do Comitê ADHOC (Especialistas Temáticos) podem emitir pareceres independentes nesta etapa."
                }
                type="warning"
                showIcon
                icon={<InfoCircleOutlined />}
                style={{ borderRadius: '12px' }}
              />
            )}

            <div>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>1. Observações Técnicas e Justificativas:</Text>
              <Input.TextArea
                value={techObs}
                onChange={(e) => setTechObs(e.target.value)}
                placeholder="Insira sua análise técnica detalhada do dossiê estatístico, logs, relatórios e limitações observadas..."
                rows={5}
                disabled={!canExecute}
                style={{ borderRadius: '12px' }}
              />
            </div>

            <div>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>2. Decisão do Parecer (Preliminar):</Text>
              <Radio.Group
                value={decision}
                onChange={(e) => setDecision(e.target.value)}
                disabled={!canExecute}
                style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
              >
                <Radio value="approved">
                  <Tag color="success">APROVADO</Tag> - O método alternativo atende a todos os requisitos técnicos e de variabilidade.
                </Radio>
                <Radio value="approved_with_restrictions">
                  <Tag color="warning">APROVADO COM RESTRIÇÕES</Tag> - O método é aceitável sob certas limitações metodológicas ou operacionais.
                </Radio>
                <Radio value="rejected">
                  <Tag color="error">REJEITADO</Tag> - O método não demonstra consistência ou reprodutibilidade adequada.
                </Radio>
                <Radio value="request_new_data">
                  <Tag color="processing">SOLICITAR NOVA RODADA DE DADOS</Tag> - Requer novos ensaios ou correções significativas nos dados atuais.
                </Radio>
              </Radio.Group>
            </div>

            {canExecute && (
              <Button
                type="primary"
                onClick={handleSubmitOpinion}
                loading={isSavingOpinion}
                disabled={!techObs.trim() || !decision}
                style={{
                  height: '42px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  marginTop: '12px',
                  backgroundColor: '#025ECC',
                  borderColor: '#025ECC'
                }}
                block
              >
                Submeter Parecer Técnico do Comitê ADHOC
              </Button>
            )}
          </Space>
        )}
      </Card>
    </Space>
  )
}
