import { useState, useMemo } from 'react'
import { Card, Typography, Table, Tag, Input, Button, Space, Flex, Alert, Divider, Descriptions, Select, Row, Col, List } from 'antd'
import { FilePdfOutlined, CheckCircleOutlined, InfoCircleOutlined, TeamOutlined, SendOutlined, SlidersOutlined, ExclamationCircleOutlined, DownloadOutlined } from '@ant-design/icons'
import { useAuth } from '../../../hooks/useAuth'
import { useProcesses, useAdhocOpinions, useGestorConsolidations, useSampleDefinitions } from '../../../hooks/useProcesses'

const { Title, Paragraph, Text } = Typography

export function GestorConsolidationTask({ task }) {
  const instanceId = task.process_instance_id
  const { user: currentUser } = useAuth()
  const { processInstanceRoles = [] } = useProcesses()
  
  const { opinions = [], isLoadingOpinions } = useAdhocOpinions(instanceId)
  const { consolidations = [], saveConsolidation, isSavingConsolidation } = useGestorConsolidations(instanceId)
  const { samples = [], blindCodes = [] } = useSampleDefinitions(instanceId)

  // Form states
  const [discussionNotes, setDiscussionNotes] = useState('')
  const [divergences, setDivergences] = useState('')
  const [limitations, setLimitations] = useState('')
  const [docNeeds, setDocNeeds] = useState('')
  const [adjustments, setAdjustments] = useState([])
  
  // Adjustment sub-form
  const [selectedLabId, setSelectedLabId] = useState(null)
  const [adjustmentDesc, setAdjustmentDesc] = useState('')

  // Load existing consolidation if available
  const existingCons = useMemo(() => {
    const cons = consolidations[0]
    if (cons) {
      // Sync local states once if existing consolidation exists
      return cons
    }
    return null
  }, [consolidations])

  // Set initial states once data is loaded
  useState(() => {
    if (existingCons) {
      setDiscussionNotes(existingCons.discussion_notes || '')
      setDivergences(existingCons.divergences || '')
      setLimitations(existingCons.methodological_limitations || '')
      setDocNeeds(existingCons.documentation_needs || '')
      setAdjustments(existingCons.adjustments_requested || [])
    }
  })

  // We sync in a hook or useEffect when existingCons loads
  useMemo(() => {
    if (existingCons) {
      setDiscussionNotes(existingCons.discussion_notes || '')
      setDivergences(existingCons.divergences || '')
      setLimitations(existingCons.methodological_limitations || '')
      setDocNeeds(existingCons.documentation_needs || '')
      setAdjustments(existingCons.adjustments_requested || [])
    }
  }, [existingCons])

  // Determine user permissions
  const userRoleObj = processInstanceRoles.find(
    r => r.instance_id === instanceId && r.user_id === currentUser?.id
  )
  const userRole = userRoleObj ? userRoleObj.role.toLowerCase() : ''
  const isGestor = userRole.includes('grupo gestor')
  const isAdmin = currentUser?.system_role === 'admin'
  const canExecute = (isGestor || isAdmin) && !task.is_completed

  // Find all participating labs to allow selecting them for adjustments
  const labs = useMemo(() => {
    return [
      { id: 10, name: 'Laboratório Alfa (Líder)' },
      { id: 11, name: 'Laboratório Beta' },
      { id: 12, name: 'Laboratório Gama' }
    ]
  }, [])

  // Full dossier with identified laboratory names & chemical substances mapped to blind codes
  const identifiedResults = useMemo(() => {
    return [
      { key: '1', lab: 'Laboratório Alfa (Líder)', chemical: 'Metil Parabeno', blindCode: 'XR-3921-K', value: '94.2%', sd: '1.2%', status: 'Válido' },
      { key: '2', lab: 'Laboratório Alfa (Líder)', chemical: 'Metil Parabeno', blindCode: 'XR-3921-K', value: '93.8%', sd: '1.4%', status: 'Válido' },
      { key: '3', lab: 'Laboratório Beta', chemical: 'Ácido Salicílico', blindCode: 'ZB-4820-L', value: '92.1%', sd: '1.8%', status: 'Válido' },
      { key: '4', lab: 'Laboratório Beta', chemical: 'Ácido Salicílico', blindCode: 'ZB-4820-L', value: '93.5%', sd: '1.1%', status: 'Válido' },
      { key: '5', lab: 'Laboratório Gama', chemical: 'Dodecil Sulfato de Sódio', blindCode: 'FT-5011-M', value: '95.0%', sd: '0.9%', status: 'Válido' },
      { key: '6', lab: 'Laboratório Gama', chemical: 'Dodecil Sulfato de Sódio', blindCode: 'FT-5011-M', value: '94.8%', sd: '0.8%', status: 'Válido' },
    ]
  }, [])

  const resultsColumns = [
    { title: 'Laboratório Participante', dataIndex: 'lab', key: 'lab', render: (val) => <Text strong>{val}</Text> },
    { title: 'Substância Química', dataIndex: 'chemical', key: 'chemical', render: (val) => <span style={{ color: '#014E2A', fontWeight: '500' }}>{val}</span> },
    { title: 'Código Cego', dataIndex: 'blindCode', key: 'blindCode', render: (code) => <Tag color="geekblue">{code}</Tag> },
    { title: 'Viabilidade Média', dataIndex: 'value', key: 'value', render: (val) => <strong>{val}</strong> },
    { title: 'Desvio Padrão', dataIndex: 'sd', key: 'sd' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <Tag color="success">{s.toUpperCase()}</Tag> }
  ]

  const handleDownloadResults = () => {
    const headers = ['Laboratório Participante', 'Substância Química', 'Código Cego', 'Viabilidade Média', 'Desvio Padrão', 'Status']
    const rows = identifiedResults.map(r => [
      r.lab,
      r.chemical,
      r.blindCode,
      r.value,
      r.sd,
      r.status
    ])
    
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `resultados_consolidados_identificados_processo_${instanceId}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleAddAdjustment = () => {
    if (!selectedLabId || !adjustmentDesc.trim()) return
    const labName = labs.find(l => l.id === selectedLabId)?.name || 'Laboratório'
    const newAdj = {
      id: adjustments.length + 1,
      laboratory_id: selectedLabId,
      laboratory_name: labName,
      description: adjustmentDesc,
      status: 'pending',
      createdAt: new Date().toISOString()
    }
    setAdjustments([...adjustments, newAdj])
    setAdjustmentDesc('')
    setSelectedLabId(null)
  }

  const handleRemoveAdjustment = (id) => {
    setAdjustments(adjustments.filter(a => a.id !== id))
  }

  const handleSaveConsolidation = () => {
    if (!discussionNotes.trim()) return
    saveConsolidation({
      instanceId,
      consolidation: {
        discussion_notes: discussionNotes,
        divergences: divergences,
        methodological_limitations: limitations,
        documentation_needs: docNeeds,
        adjustments_requested: adjustments
      }
    })
  }

  const getDecisionTagColor = (dec) => {
    switch (dec) {
      case 'approved': return 'success'
      case 'approved_with_restrictions': return 'warning'
      case 'rejected': return 'error'
      case 'request_new_data': return 'processing'
      default: return 'default'
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
      
      {/* 1. VISUALIZAÇÃO DOS PARECERES DO COMITÊ ADHOC */}
      <Card 
        title={
          <Flex align="center" gap={8}>
            <TeamOutlined style={{ color: '#025ECC' }} />
            <span style={{ fontFamily: 'Barlow, sans-serif', color: '#014E2A' }}>Pareceres do Comitê ADHOC</span>
          </Flex>
        }
        size="small" 
        style={{ borderRadius: '20px', border: '1px solid #EFEFEF', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}
      >
        <Paragraph>
          Abaixo estão os pareceres e decisões individuais submetidos pelos avaliadores do Comitê ADHOC.
        </Paragraph>
        {opinions.length === 0 ? (
          <Alert
            message="Aguardando Pareceres"
            description="Nenhum parecer técnico foi submetido pelo Comitê ADHOC até o momento."
            type="warning"
            showIcon
            style={{ borderRadius: '12px' }}
          />
        ) : (
          <List
            itemLayout="vertical"
            dataSource={opinions}
            renderItem={(op) => (
              <List.Item key={op.id} style={{ padding: '16px 0' }}>
                <Card size="small" style={{ borderRadius: '12px', border: '1px solid #eef0f2', background: '#FAFAFA' }}>
                  <Flex justify="space-between" align="center" style={{ marginBottom: '8px' }}>
                    <Text strong style={{ fontSize: '14px', color: '#014E2A' }}>Avaliador: {op.user_name}</Text>
                    <Tag color={getDecisionTagColor(op.preliminary_decision)}>
                      {getDecisionLabel(op.preliminary_decision).toUpperCase()}
                    </Tag>
                  </Flex>
                  <Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap', color: '#434343' }}>
                    <strong>Observações Técnicas:</strong> {op.technical_observations}
                  </Paragraph>
                  <Divider style={{ margin: '8px 0' }} />
                  <Text type="secondary" style={{ fontSize: '11px' }}>
                    Enviado em: {new Date(op.createdAt).toLocaleString()}
                  </Text>
                </Card>
              </List.Item>
            )}
          />
        )}
      </Card>

      {/* 2. DOSSIÊ COMPLETO COM IDENTIFICAÇÃO DOS LABORATÓRIOS */}
      <Card 
        title={
          <Flex align="center" gap={8}>
            <SlidersOutlined style={{ color: '#014E2A' }} />
            <span style={{ fontFamily: 'Barlow, sans-serif', color: '#014E2A' }}>Dossiê Completo de Validação (Identificado)</span>
          </Flex>
        }
        size="small" 
        style={{ borderRadius: '20px', border: '1px solid #EFEFEF', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}
      >
        <Paragraph>
          Como membro do Grupo Gestor, você tem acesso às identidades reais dos laboratórios geradores dos resultados
          e à caracterização das substâncias químicas testadas.
        </Paragraph>
        
        <Divider orientation="left" style={{ margin: '12px 0' }}><Text strong style={{ fontSize: '13px' }}>1. Parâmetros Metodológicos Estabelecidos</Text></Divider>
        <Descriptions 
          bordered 
          size="small" 
          column={1} 
          style={{ marginBottom: '16px' }}
          labelStyle={{ width: '30%', minWidth: '220px', fontWeight: '500' }}
          contentStyle={{ wordBreak: 'normal' }}
        >
          <Descriptions.Item label="Nome do Método">Método In-Vitro de Viabilidade Epicutânea</Descriptions.Item>
          <Descriptions.Item label="Princípio Relevante">Princípio dos 3Rs (Substituição in-vivo por modelo celular)</Descriptions.Item>
          <Descriptions.Item label="Replicatas de Teste">3 réplicas técnicas</Descriptions.Item>
          <Descriptions.Item label="Concentração Máxima">
            <span style={{ whiteSpace: 'nowrap' }}>100.0 μg/mL</span>
          </Descriptions.Item>
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
        <Flex justify="end" style={{ marginBottom: '12px' }}>
          <Button 
            type="primary" 
            ghost
            icon={<DownloadOutlined />} 
            size="small" 
            style={{ borderRadius: '12px' }}
            onClick={handleDownloadResults}
          >
            Exportar Resultados (CSV)
          </Button>
        </Flex>
        <Table 
          dataSource={identifiedResults} 
          columns={resultsColumns} 
          pagination={false} 
          size="small" 
          bordered 
          style={{ marginBottom: '24px' }}
        />

        <Divider orientation="left" style={{ margin: '12px 0' }}><Text strong style={{ fontSize: '13px' }}>3. Caracterização Química das Amostras Submetidas</Text></Divider>
        <Card style={{ backgroundColor: '#FAFAFA', borderRadius: '12px', border: '1px solid #EFEFEF', padding: '8px' }}>
          <Descriptions size="small" column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label="Substância A (Metil Parabeno)">CAS: 99-76-3 | Líquido | Volatilidade: Baixa</Descriptions.Item>
            <Descriptions.Item label="Substância B (Ácido Salicílico)">CAS: 69-72-7 | Sólido | Volatilidade: Nula</Descriptions.Item>
            <Descriptions.Item label="Substância C (DSD)">CAS: 151-21-3 | Sólido (pó) | Volatilidade: Nula</Descriptions.Item>
          </Descriptions>
        </Card>
      </Card>

      {/* 3. CONSOLIDAÇÃO TÉCNICA DO GRUPO GESTOR */}
      <Card 
        title={
          <Flex align="center" gap={8}>
            <CheckCircleOutlined style={{ color: '#014E2A' }} />
            <span style={{ fontFamily: 'Barlow, sans-serif', color: '#014E2A' }}>Registros e Consolidação da Reunião Técnica</span>
          </Flex>
        }
        size="small" 
        style={{ borderRadius: '20px', border: '1px solid #EFEFEF', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}
      >
        {task.is_completed ? (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Alert
              message="Consolidação Técnica Salva"
              description="A consolidação das discussões de reunião foi concluída e salva com sucesso. O fluxo seguiu para a deliberação final."
              type="success"
              showIcon
              icon={<CheckCircleOutlined />}
            />
            {existingCons && (
              <Card style={{ backgroundColor: '#FAFAFA', borderRadius: '12px' }}>
                <Descriptions title="Detalhes da Consolidação" size="small" column={1}>
                  <Descriptions.Item label="Discussão de Reunião">
                    <div style={{ backgroundColor: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #EFEFEF', whiteSpace: 'pre-wrap' }}>
                      {existingCons.discussion_notes}
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item label="Divergências Identificadas">
                    <div style={{ backgroundColor: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #EFEFEF', whiteSpace: 'pre-wrap' }}>
                      {existingCons.divergences || 'Nenhuma divergência identificada.'}
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item label="Limitações Metodológicas Observadas">
                    <div style={{ backgroundColor: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #EFEFEF', whiteSpace: 'pre-wrap' }}>
                      {existingCons.methodological_limitations || 'Nenhuma limitação observada.'}
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item label="Necessidades de Complementação Documental">
                    <div style={{ backgroundColor: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #EFEFEF', whiteSpace: 'pre-wrap' }}>
                      {existingCons.documentation_needs || 'Nenhuma complementação requerida.'}
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item label="Solicitações de Ajustes Enviadas">
                    {existingCons.adjustments_requested && existingCons.adjustments_requested.length > 0 ? (
                      <List
                        size="small"
                        bordered
                        dataSource={existingCons.adjustments_requested}
                        renderItem={item => (
                          <List.Item>
                            <Space>
                              <Tag color="orange">{item.laboratory_name}</Tag>
                              <Text>{item.description}</Text>
                              <Tag color="processing">{item.status.toUpperCase()}</Tag>
                            </Space>
                          </List.Item>
                        )}
                      />
                    ) : (
                      'Nenhum ajuste solicitado.'
                    )}
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
                description="Apenas membros designados do Grupo Gestor podem consolidar os pareceres e preencher a ata técnica de discussão."
                type="warning"
                showIcon
                icon={<InfoCircleOutlined />}
                style={{ borderRadius: '12px' }}
              />
            )}

            <div>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>1. Discussões Técnicas da Reunião de Avaliação (Ata):</Text>
              <Input.TextArea
                value={discussionNotes}
                onChange={(e) => setDiscussionNotes(e.target.value)}
                placeholder="Insira os principais pontos discutidos na reunião do Grupo Gestor sobre o método e os pareceres recebidos..."
                rows={4}
                disabled={!canExecute}
                style={{ borderRadius: '12px' }}
              />
            </div>

            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Text strong style={{ display: 'block', marginBottom: '8px' }}>2. Divergências Identificadas entre Pareceres:</Text>
                <Input.TextArea
                  value={divergences}
                  onChange={(e) => setDivergences(e.target.value)}
                  placeholder="Se houver, registre divergências de opinião entre os avaliadores..."
                  rows={3}
                  disabled={!canExecute}
                  style={{ borderRadius: '12px' }}
                />
              </Col>
              <Col xs={24} md={12}>
                <Text strong style={{ display: 'block', marginBottom: '8px' }}>3. Limitações Metodológicas Observadas:</Text>
                <Input.TextArea
                  value={limitations}
                  onChange={(e) => setLimitations(e.target.value)}
                  placeholder="Se aplicável, relate limitações metodológicas observadas no ensaio..."
                  rows={3}
                  disabled={!canExecute}
                  style={{ borderRadius: '12px' }}
                />
              </Col>
            </Row>

            <div>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>4. Necessidades de Complementação Documental:</Text>
              <Input.TextArea
                value={docNeeds}
                onChange={(e) => setDocNeeds(e.target.value)}
                placeholder="Indique se há alguma documentação ou protocolo ausente que os laboratórios ou o proponente precisam anexar..."
                rows={2}
                disabled={!canExecute}
                style={{ borderRadius: '12px' }}
              />
            </div>

            {/* SEÇÃO INTERATIVA: SOLICITAÇÃO DE AJUSTES AOS LABORATÓRIOS */}
            <Divider style={{ margin: '12px 0' }} />
            <div>
              <Title level={5} style={{ fontFamily: 'Barlow, sans-serif', color: '#014E2A', margin: '0 0 12px 0', fontSize: '14px' }}>
                Solicitar Ajustes aos Laboratórios Participantes
              </Title>
              {canExecute && (
                <Card size="small" style={{ backgroundColor: '#FAFAFA', borderRadius: '12px', border: '1px solid #eef0f2', marginBottom: '12px' }}>
                  <Row gutter={[16, 16]} align="bottom">
                    <Col xs={24} sm={10}>
                      <Text type="secondary" style={{ display: 'block', marginBottom: '6px', fontSize: '12px' }}>Selecionar Laboratório:</Text>
                      <Select
                        value={selectedLabId}
                        onChange={setSelectedLabId}
                        placeholder="Selecione o laboratório"
                        style={{ width: '100%', fontFamily: 'Lexend, sans-serif' }}
                        options={labs.map(l => ({ value: l.id, label: l.name }))}
                      />
                    </Col>
                    <Col xs={24} sm={10}>
                      <Text type="secondary" style={{ display: 'block', marginBottom: '6px', fontSize: '12px' }}>Descrição do Ajuste Solicitado:</Text>
                      <Input
                        value={adjustmentDesc}
                        onChange={(e) => setAdjustmentDesc(e.target.value)}
                        placeholder="Ex: Refazer curva de calibração para amostra X"
                        style={{ borderRadius: '8px' }}
                      />
                    </Col>
                    <Col xs={24} sm={4}>
                      <Button
                        type="primary"
                        icon={<SendOutlined />}
                        disabled={!selectedLabId || !adjustmentDesc.trim()}
                        onClick={handleAddAdjustment}
                        style={{ width: '100%', borderRadius: '8px', backgroundColor: '#025ECC' }}
                      >
                        Enviar
                      </Button>
                    </Col>
                  </Row>
                </Card>
              )}

              {/* LIST OF CURRENT ADJUSTMENTS */}
              {adjustments.length > 0 ? (
                <List
                  size="small"
                  bordered
                  dataSource={adjustments}
                  style={{ borderRadius: '12px', backgroundColor: '#fff' }}
                  renderItem={item => (
                    <List.Item 
                      actions={canExecute ? [
                        <Button type="link" danger onClick={() => handleRemoveAdjustment(item.id)}>Remover</Button>
                      ] : []}
                    >
                      <Space>
                        <Tag color="orange">{item.laboratory_name}</Tag>
                        <Text style={{ fontSize: '13px' }}>{item.description}</Text>
                        <Tag color="processing">PENDENTE DE ENVIO</Tag>
                      </Space>
                    </List.Item>
                  )}
                />
              ) : (
                <Text type="secondary" style={{ fontSize: '13px', fontStyle: 'italic' }}>Nenhuma solicitação de ajuste criada para esta rodada.</Text>
              )}
            </div>

            {canExecute && (
              <Button
                type="primary"
                onClick={handleSaveConsolidation}
                loading={isSavingConsolidation}
                disabled={!discussionNotes.trim()}
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
                Salvar e Concluir Consolidação Técnica
              </Button>
            )}
          </Space>
        )}
      </Card>
    </Space>
  )
}
