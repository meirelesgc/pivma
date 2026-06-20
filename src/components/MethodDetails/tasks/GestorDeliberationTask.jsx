import { useState, useMemo } from 'react'
import { Card, Typography, Tag, Input, Button, Space, Flex, Alert, Divider, Descriptions, Select, Switch, Upload, message } from 'antd'
import { FilePdfOutlined, CheckCircleOutlined, InfoCircleOutlined, SafetyCertificateOutlined, InboxOutlined, CloudUploadOutlined, TrophyOutlined } from '@ant-design/icons'
import { useAuth } from '../../../hooks/useAuth'
import { useProcesses, useAdhocOpinions, useGestorConsolidations, useFinalDeliberations } from '../../../hooks/useProcesses'

const { Title, Paragraph, Text } = Typography
const { Dragger } = Upload

export function GestorDeliberationTask({ task }) {
  const instanceId = task.process_instance_id
  const { user: currentUser } = useAuth()
  const { processInstanceRoles = [] } = useProcesses()
  
  const { opinions = [] } = useAdhocOpinions(instanceId)
  const { consolidations = [] } = useGestorConsolidations(instanceId)
  const { deliberations = [], saveDeliberation, isSavingDeliberation } = useFinalDeliberations(instanceId)

  // Form states
  const [finalDecision, setFinalDecision] = useState('')
  const [institutionalOpinion, setInstitutionalOpinion] = useState('')
  const [institutionalApproval, setInstitutionalApproval] = useState(false)
  const [officialDocName, setOfficialDocName] = useState('')
  const [regulatoryRecommendation, setRegulatoryRecommendation] = useState('')
  const [uploadedFile, setUploadedFile] = useState(null)

  // Load existing deliberation if available
  const existingDelib = useMemo(() => {
    return deliberations[0] || null
  }, [deliberations])

  // Sync initial states once data loads
  useMemo(() => {
    if (existingDelib) {
      setFinalDecision(existingDelib.final_decision || '')
      setInstitutionalOpinion(existingDelib.institutional_opinion || '')
      setInstitutionalApproval(existingDelib.institutional_approval || false)
      setOfficialDocName(existingDelib.official_documentation || '')
      setRegulatoryRecommendation(existingDelib.regulatory_recommendation || '')
    }
  }, [existingDelib])

  // Determine user permissions
  const userRoleObj = processInstanceRoles.find(
    r => r.instance_id === instanceId && r.user_id === currentUser?.id
  )
  const userRole = userRoleObj ? userRoleObj.role.toLowerCase() : ''
  const isGestor = userRole.includes('grupo gestor')
  const isAdmin = currentUser?.system_role === 'admin'
  const canExecute = (isGestor || isAdmin) && !task.is_completed

  // Find consolidation tech details
  const consolidation = consolidations[0]

  const handleUploadPDF = (info) => {
    const file = info.file
    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf')
    if (!isPdf) {
      message.error('Apenas arquivos PDF são aceitos para homologação formal.')
      return Upload.LIST_IGNORE
    }
    setUploadedFile(file)
    setOfficialDocName(file.name)
    message.success(`${file.name} foi carregado localmente com sucesso!`)
    return false
  }

  const handlePublish = () => {
    if (!finalDecision || !institutionalOpinion.trim() || !institutionalApproval || !officialDocName || !regulatoryRecommendation) {
      message.error('Por favor, preencha todos os campos obrigatórios e confirme a aprovação antes de publicar.')
      return
    }
    
    saveDeliberation({
      instanceId,
      deliberation: {
        final_decision: finalDecision,
        institutional_opinion: institutionalOpinion,
        institutional_approval: institutionalApproval,
        official_documentation: officialDocName,
        regulatory_recommendation: regulatoryRecommendation,
        is_published: true
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
      
      {/* 1. COMPILAÇÃO DE ANÁLISES ANTERIORES */}
      <Card 
        title={
          <Flex align="center" gap={8}>
            <SafetyCertificateOutlined style={{ color: '#025ECC' }} />
            <span style={{ fontFamily: 'Barlow, sans-serif', color: '#014E2A' }}>Resumo Técnico de Pareceres & Consolidação</span>
          </Flex>
        }
        size="small" 
        style={{ borderRadius: '20px', border: '1px solid #EFEFEF', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}
      >
        <Descriptions size="small" column={{ xs: 1, sm: 2 }} bordered style={{ marginBottom: '16px' }}>
          <Descriptions.Item label="Pareceres Emitidos pelo Comitê ADHOC">
            {opinions.length > 0 ? (
              <Flex gap={6} wrap="wrap">
                {opinions.map(o => (
                  <Tag key={o.id} color={getDecisionTagColor(o.preliminary_decision)}>
                    {o.user_name}: {getDecisionLabel(o.preliminary_decision)}
                  </Tag>
                ))}
              </Flex>
            ) : (
              <Text type="secondary" style={{ fontStyle: 'italic' }}>Nenhum parecer emitido ainda.</Text>
            )}
          </Descriptions.Item>
          
          <Descriptions.Item label="Ata da Consolidação Técnica (Discussão)">
            {consolidation ? (
              <Text ellipsis={{ tooltip: consolidation.discussion_notes }} style={{ maxWidth: '280px', display: 'inline-block' }}>
                {consolidation.discussion_notes}
              </Text>
            ) : (
              <Text type="secondary" style={{ fontStyle: 'italic' }}>Consolidação técnica pendente.</Text>
            )}
          </Descriptions.Item>

          <Descriptions.Item label="Divergências Registradas">
            {consolidation?.divergences ? consolidation.divergences : <Text type="secondary">Nenhuma divergência registrada.</Text>}
          </Descriptions.Item>
          
          <Descriptions.Item label="Limitações Metodológicas">
            {consolidation?.methodological_limitations ? consolidation.methodological_limitations : <Text type="secondary">Nenhuma limitação relatada.</Text>}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 2. DELIBERAÇÃO FINAL E PUBLICAÇÃO */}
      <Card 
        title={
          <Flex align="center" gap={8}>
            <TrophyOutlined style={{ color: '#014E2A' }} />
            <span style={{ fontFamily: 'Barlow, sans-serif', color: '#014E2A' }}>Deliberação Formal & Publicação Institucional</span>
          </Flex>
        }
        size="small" 
        style={{ borderRadius: '20px', border: '1px solid #EFEFEF', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}
      >
        {task.is_completed || existingDelib?.is_published ? (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Alert
              message="Validação Homologada e Publicada!"
              description="A validação do método alternativo foi concluída institucionalmente. A decisão e a portaria oficial foram publicadas no sistema da BraCVAM."
              type="success"
              showIcon
              icon={<TrophyOutlined style={{ fontSize: '24px', color: '#52c41a' }} />}
              style={{ borderRadius: '16px', padding: '16px' }}
            />
            {existingDelib && (
              <Card style={{ backgroundColor: '#FAFAFA', borderRadius: '12px' }}>
                <Descriptions title="Resultado Oficial da Validação" size="small" column={1}>
                  <Descriptions.Item label="Decisão Final">
                    <Tag color={getDecisionTagColor(existingDelib.final_decision)} style={{ fontSize: '12px', padding: '4px 12px' }}>
                      {getDecisionLabel(existingDelib.final_decision).toUpperCase()}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Parecer Institucional Consolidado">
                    <div style={{ backgroundColor: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #EFEFEF', whiteSpace: 'pre-wrap' }}>
                      {existingDelib.institutional_opinion}
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item label="Aprovação Institucional">
                    <Tag color="success">HOMOLOGADA E REGISTRADA</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Portaria / Documentação Oficial">
                    <Space>
                      <FilePdfOutlined style={{ color: '#ff4d4f' }} />
                      <Text strong>{existingDelib.official_documentation}</Text>
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="Recomendação Regulatória">
                    <Tag color="cyan">{existingDelib.regulatory_recommendation}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Publicado em">
                    {new Date(existingDelib.published_at).toLocaleString()}
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
                description="Apenas membros designados do Grupo Gestor ou administradores da BraCVAM podem registrar a deliberação institucional final."
                type="warning"
                showIcon
                icon={<InfoCircleOutlined />}
                style={{ borderRadius: '12px' }}
              />
            )}

            {/* SELEÇÃO DA DECISÃO FINAL */}
            <div>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>1. Decisão Final de Validação:</Text>
              <Select
                value={finalDecision || undefined}
                onChange={setFinalDecision}
                placeholder="Selecione o status final da validação do método"
                style={{ width: '100%', fontFamily: 'Lexend, sans-serif' }}
                disabled={!canExecute}
                options={[
                  { value: 'approved', label: 'Aprovado (Homologado)' },
                  { value: 'approved_with_restrictions', label: 'Aprovado com Restrições' },
                  { value: 'rejected', label: 'Rejeitado (Não Validado)' },
                  { value: 'request_new_data', label: 'Solicitar nova rodada de dados estatísticos' }
                ]}
              />
            </div>

            {/* PARECER INSTITUCIONAL TEXTAREA */}
            <div>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>2. Parecer Institucional Consolidado:</Text>
              <Input.TextArea
                value={institutionalOpinion}
                onChange={(e) => setInstitutionalOpinion(e.target.value)}
                placeholder="Insira a fundamentação jurídica, técnica e regulatória que justifica a decisão final institucional..."
                rows={5}
                disabled={!canExecute}
                style={{ borderRadius: '12px' }}
              />
            </div>

            {/* RECOMENDAÇÃO REGULATÓRIA */}
            <div>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>3. Recomendação Regulatória Aplicável:</Text>
              <Select
                value={regulatoryRecommendation || undefined}
                onChange={setRegulatoryRecommendation}
                placeholder="Selecione a diretriz ou recomendação regulatória"
                style={{ width: '100%', fontFamily: 'Lexend, sans-serif' }}
                disabled={!canExecute}
                options={[
                  { value: 'Substituição Plena', label: 'Substituição Plena do Ensaio in-vivo correspondente' },
                  { value: 'Uso Integrado (IATA)', label: 'Uso Integrado em Estratégias Abordadas de Testes (IATA)' },
                  { value: 'Triagem Inicial', label: 'Uso restrito para triagem inicial ou controle interno' },
                  { value: 'Não Recomendado', label: 'Método não recomendado para fins regulatórios' }
                ]}
              />
            </div>

            {/* UPLOAD DA DOCUMENTAÇÃO OFICIAL */}
            <div>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>4. Upload da Documentação Oficial / Portaria (PDF):</Text>
              <Upload
                name="file"
                multiple={false}
                beforeUpload={() => false}
                onChange={handleUploadPDF}
                showUploadList={false}
                disabled={!canExecute}
              >
                <Button 
                  icon={<CloudUploadOutlined />} 
                  disabled={!canExecute}
                  style={{ borderRadius: '8px' }}
                >
                  Selecionar PDF Oficial
                </Button>
              </Upload>
              {officialDocName && (
                <Alert
                  message={
                    <Space>
                      <FilePdfOutlined style={{ color: '#ff4d4f' }} />
                      <Text strong>{officialDocName}</Text>
                    </Space>
                  }
                  type="info"
                  showIcon={false}
                  style={{ marginTop: '8px', borderRadius: '8px' }}
                />
              )}
            </div>

            {/* CONFIRMAÇÃO DE APROVAÇÃO INSTITUCIONAL */}
            <Divider style={{ margin: '12px 0' }} />
            <Flex justify="space-between" align="center" style={{ backgroundColor: '#FAFAFA', padding: '12px 16px', borderRadius: '12px', border: '1px solid #eef0f2' }}>
              <div>
                <Text strong style={{ display: 'block' }}>Aprovação e Assinatura Institucional</Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>Declaro formalmente a aprovação do parecer acima e a conclusão do estudo de validação.</Text>
              </div>
              <Switch
                checked={institutionalApproval}
                onChange={setInstitutionalApproval}
                disabled={!canExecute}
              />
            </Flex>

            {canExecute && (
              <Button
                type="primary"
                onClick={handlePublish}
                loading={isSavingDeliberation}
                disabled={!finalDecision || !institutionalOpinion.trim() || !institutionalApproval || !officialDocName || !regulatoryRecommendation}
                style={{
                  height: '48px',
                  borderRadius: '12px',
                  fontWeight: '700',
                  marginTop: '12px',
                  backgroundColor: '#014E2A',
                  borderColor: '#014E2A',
                  boxShadow: '0 4px 12px rgba(1, 78, 42, 0.15)'
                }}
                block
              >
                Publicar Deliberação Final e Concluir Processo
              </Button>
            )}
          </Space>
        )}
      </Card>
    </Space>
  )
}
