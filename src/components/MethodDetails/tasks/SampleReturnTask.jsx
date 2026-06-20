import { useState, useEffect } from 'react'
import { Row, Col, Card, Typography, Input, InputNumber, Button, Alert, Tag, Space, Flex, message } from 'antd'
import { BarcodeOutlined, CheckCircleOutlined, LockOutlined, SmileOutlined, WarningOutlined } from '@ant-design/icons'
import { useAuth } from '../../../hooks/useAuth'
import { useProcesses, useFormTask, useSampleDefinitions } from '../../../hooks/useProcesses'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

export function SampleReturnTask({ task, onToggle }) {
  const { user: currentUser } = useAuth()
  const { processInstanceRoles = [] } = useProcesses()
  
  const { 
    samples = [], 
    blindCodes = [], 
    isLoadingSamples, 
    isLoadingBlindCodes 
  } = useSampleDefinitions(task.process_instance_id)

  const { answers = {}, saveAnswers } = useFormTask(null, task.id)
  const [returns, setReturns] = useState({})
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)

  useEffect(() => {
    if (answers && answers.returns) {
      setReturns(answers.returns)
    }
  }, [answers])

  // Determine user role in this process instance
  const userRoleObj = processInstanceRoles.find(
    r => r.instance_id === task.process_instance_id && r.user_id === currentUser?.id
  )
  const isLabParticipant = userRoleObj ? userRoleObj.role.toLowerCase() === 'laboratórios participantes' : false
  const isAdmin = currentUser?.system_role === 'admin'
  const canExecute = (isLabParticipant || isAdmin) && !task.is_completed

  // Fallback role ID if user is admin
  const targetLabRole = processInstanceRoles.find(
    r => r.instance_id === task.process_instance_id && r.role.toLowerCase() === 'laboratórios participantes'
  )
  const labRoleId = isLabParticipant ? userRoleObj.id : (targetLabRole ? targetLabRole.id : null)

  const handleChange = (sampleId, key, value) => {
    const updated = {
      ...returns,
      [sampleId]: {
        ...returns[sampleId],
        [key]: value
      }
    }
    setReturns(updated)
    saveAnswers({ instanceTaskId: task.id, answers: { ...answers, returns: updated } })
  }

  // Get designated blind code for a sample
  const getDesignatedBlindCode = (sampleId) => {
    if (!labRoleId) return null
    const bc = blindCodes.find(bc => Number(bc.sample_id) === Number(sampleId) && Number(bc.laboratory_role_id) === Number(labRoleId))
    return bc ? bc.blind_code : null
  }

  // Business validations for individual sample return
  const checkSampleReturnValidation = (sample) => {
    const ret = returns[sample.id] || {}
    const designatedCode = getDesignatedBlindCode(sample.id)
    
    const isCodeEmpty = !String(ret.blind_code || '').trim()
    const isCodeValid = String(ret.blind_code || '').trim() === String(designatedCode || '').trim()
    
    // Fields only required and checked if code matches
    const isFlasksValid = ret.empty_flasks !== undefined && ret.empty_flasks !== null && ret.empty_flasks >= 0
    const isVolumeValid = ret.unconsumed_volume !== undefined && ret.unconsumed_volume !== null && ret.unconsumed_volume >= 0

    return {
      isCodeEmpty,
      isCodeValid,
      isFlasksValid,
      isVolumeValid,
      isValid: isCodeValid && isFlasksValid && isVolumeValid
    }
  }

  const isFormValid = samples.length > 0 && samples.every(sample => checkSampleReturnValidation(sample).isValid)

  const handleSubmit = () => {
    setAttemptedSubmit(true)
    if (!isFormValid) {
      message.error('Por favor, identifique corretamente todas as amostras pelo código cego e preencha as informações de devolução.')
      return
    }

    // Save final answers and toggle task completion
    saveAnswers({ 
      instanceTaskId: task.id, 
      answers: { ...answers, returns, submitted: true } 
    }, {
      onSuccess: () => {
        onToggle() // completing the task
        message.success('Confirmação de devolução de amostras registrada!')
      },
      onError: () => {
        message.error('Erro ao registrar a devolução.')
      }
    })
  }

  if (isLoadingSamples || isLoadingBlindCodes) {
    return <Text type="secondary">Carregando dados das amostras...</Text>
  }

  if (samples.length === 0) {
    return <Alert message="Nenhuma amostra cadastrada para este processo de validação." type="warning" showIcon />
  }

  return (
    <Card
      style={{
        borderRadius: '20px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)',
        border: '1px solid #eef0f2',
        background: '#ffffff',
        padding: '8px'
      }}
    >
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        {isAdmin && !isLabParticipant && (
          <Alert
            message="Visualização de Administrador"
            description="Você está visualizando esta tela como administrador. Para fins de teste e validação, os códigos cegos foram simulados com base no primeiro Laboratório Participante."
            type="info"
            showIcon
            style={{ borderRadius: '12px' }}
          />
        )}

        {!canExecute && !task.is_completed && (
          <Alert
            message="Acesso Restrito"
            description="Esta tarefa deve ser preenchida exclusivamente por representantes de um Laboratório Participante."
            type="warning"
            showIcon
            icon={<LockOutlined />}
            style={{ borderRadius: '12px' }}
          />
        )}

        {task.is_completed && (
          <Alert
            message="Devolução Registrada"
            description="A devolução física das amostras foi declarada e confirmada por este laboratório."
            type="success"
            showIcon
            icon={<CheckCircleOutlined />}
            style={{ borderRadius: '12px' }}
          />
        )}

        <div>
          <Title level={4} style={{ fontFamily: 'Barlow, sans-serif', color: '#014E2A', margin: '0 0 8px 0' }}>
            Confirmação de Devolução de Amostras
          </Title>
          <Paragraph style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>
            Declare os resíduos químicos e embalagens físicas devolvidas para a Central de Seleção de Amostras. 
            <strong> É obrigatório identificar a amostra digitando o respectivo código cego antes de preencher os dados de retorno.</strong>
          </Paragraph>
        </div>

        <Row gutter={[24, 24]}>
          {samples.map((sample, index) => {
            const ret = returns[sample.id] || {}
            const validation = checkSampleReturnValidation(sample)
            const designatedCode = getDesignatedBlindCode(sample.id)

            // Real-time checks
            const showCodeError = (attemptedSubmit || !validation.isCodeEmpty) && !validation.isCodeValid
            const showFlasksError = attemptedSubmit && validation.isCodeValid && !validation.isFlasksValid
            const showVolumeError = attemptedSubmit && validation.isCodeValid && !validation.isVolumeValid

            // Form elements are disabled until code matches designated blind code
            const isReturnInputDisabled = !validation.isCodeValid || !canExecute

            return (
              <Col xs={24} key={sample.id}>
                <Card
                  hoverable
                  style={{
                    borderRadius: '16px',
                    border: task.is_completed 
                      ? '1.5px solid #A3ED40' 
                      : (validation.isValid ? '1.5px solid #025ECC' : '1px solid #EFEFEF'),
                    background: '#FAFAFA',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
                  }}
                  bodyStyle={{ padding: '24px' }}
                >
                  <Row gutter={[16, 20]}>
                    {/* Left Side: Physical description */}
                    <Col xs={24} md={10}>
                      <Space direction="vertical" size={12} style={{ width: '100%' }}>
                        <Flex align="center" gap={8}>
                          <Tag color="orange" style={{ borderRadius: '6px', fontWeight: 'bold' }}>
                            ITEM #{index + 1}
                          </Tag>
                          <Text strong style={{ fontSize: '16px', color: '#111827', fontFamily: 'Barlow, sans-serif' }}>
                            {sample.physical_state} - {sample.appearance}
                          </Text>
                        </Flex>
                        
                        <div style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #EFEFEF' }}>
                          <Space direction="vertical" size={6} style={{ width: '100%', fontSize: '13px' }}>
                            <div>
                              <Text type="secondary">Classe Química: </Text>
                              <Text strong>{(sample.chemical_class || []).join(', ') || 'N/A'}</Text>
                            </div>
                            <div>
                              <Text type="secondary">Classe de Produto: </Text>
                              <Text strong>{(sample.product_class || []).join(', ') || 'N/A'}</Text>
                            </div>
                            <div>
                              <Text type="secondary">Protocolo de Descarte/Retorno: </Text>
                              <Text type="danger" strong>{sample.disposal_instructions || 'N/A'}</Text>
                            </div>
                            {task.is_completed && designatedCode && (
                              <div style={{ marginTop: '8px' }}>
                                <Tag icon={<BarcodeOutlined />} color="blue">
                                  CÓDIGO CEGO DEVOLVIDO: {designatedCode}
                                </Tag>
                              </div>
                            )}
                          </Space>
                        </div>
                      </Space>
                    </Col>

                    {/* Right Side: Return Inputs */}
                    <Col xs={24} md={14}>
                      <Row gutter={[16, 16]}>
                        {/* 1. Identification (Lock screen pattern) */}
                        <Col xs={24}>
                          <span style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151', fontSize: '13px' }}>
                            Identificação Pelo Código Cego da Amostra *
                          </span>
                          <Input
                            placeholder="Insira o código cego para liberar os campos de devolução"
                            prefix={<BarcodeOutlined style={{ color: '#6B7280' }} />}
                            value={ret.blind_code || ''}
                            onChange={(e) => handleChange(sample.id, 'blind_code', e.target.value)}
                            disabled={!canExecute}
                            status={showCodeError ? 'error' : ''}
                            style={{ borderRadius: '12px', height: '40px' }}
                          />
                          {showCodeError && (
                            <Text type="danger" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                              {!ret.blind_code 
                                ? 'Identifique o código cego para liberar a inserção.' 
                                : 'Código cego não confere. Verifique o recipiente físico.'}
                            </Text>
                          )}
                          {!validation.isCodeEmpty && validation.isCodeValid && (
                            <Text type="success" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                              🟢 Amostra desbloqueada! Preencha as quantidades abaixo.
                            </Text>
                          )}
                        </Col>

                        {/* 2. Empty Flasks */}
                        <Col xs={24} sm={12}>
                          <span style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: isReturnInputDisabled ? '#A3A3A3' : '#374151', fontSize: '13px' }}>
                            Frascos Vazios Retornados *
                          </span>
                          <InputNumber
                            placeholder="Qtd de frascos"
                            min={0}
                            style={{ width: '100%', borderRadius: '12px', height: '40px', lineHeight: '40px' }}
                            value={ret.empty_flasks}
                            onChange={(val) => handleChange(sample.id, 'empty_flasks', val)}
                            disabled={isReturnInputDisabled}
                            status={showFlasksError ? 'error' : ''}
                          />
                          {showFlasksError && (
                            <Text type="danger" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                              Insira a quantidade (digite 0 se nenhum).
                            </Text>
                          )}
                        </Col>

                        {/* 3. Unconsumed Volume */}
                        <Col xs={24} sm={12}>
                          <span style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: isReturnInputDisabled ? '#A3A3A3' : '#374151', fontSize: '13px' }}>
                            Volume Não Consumido *
                          </span>
                          <InputNumber
                            placeholder={`Volume residual em ${sample.unit || 'ml'}`}
                            min={0}
                            style={{ width: '100%', borderRadius: '12px', height: '40px', lineHeight: '40px' }}
                            value={ret.unconsumed_volume}
                            onChange={(val) => handleChange(sample.id, 'unconsumed_volume', val)}
                            disabled={isReturnInputDisabled}
                            status={showVolumeError ? 'error' : ''}
                            addonAfter={sample.unit || 'ml'}
                          />
                          {showVolumeError && (
                            <Text type="danger" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                              Insira o volume residual (digite 0 se consumido total).
                            </Text>
                          )}
                        </Col>

                        {/* 4. Description of physical items returned */}
                        <Col xs={24}>
                          <span style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: isReturnInputDisabled ? '#A3A3A3' : '#374151', fontSize: '13px' }}>
                            Descrição dos Itens Físicos Devolvidos e Detalhes
                          </span>
                          <TextArea
                            rows={2}
                            placeholder="Descreva o estado dos recipientes, lacres ou outros resíduos enviados."
                            value={ret.description || ''}
                            onChange={(e) => handleChange(sample.id, 'description', e.target.value)}
                            disabled={isReturnInputDisabled}
                            style={{ borderRadius: '12px' }}
                          />
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Card>
              </Col>
            )
          })}
        </Row>

        {canExecute && (
          <Flex justify="end" style={{ marginTop: '8px' }}>
            <Button
              type="primary"
              size="large"
              icon={<CheckCircleOutlined />}
              onClick={handleSubmit}
              style={{
                borderRadius: '12px',
                height: '48px',
                fontWeight: '600',
                backgroundColor: '#025ECC',
                borderColor: '#025ECC',
                boxShadow: '0 4px 12px rgba(2, 94, 204, 0.2)'
              }}
            >
              Confirmar Devolução de Amostras
            </Button>
          </Flex>
        )}
      </Space>
    </Card>
  )
}
