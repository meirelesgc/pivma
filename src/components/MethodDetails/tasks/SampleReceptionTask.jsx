import { useState, useEffect } from 'react'
import { Row, Col, Card, Typography, Input, InputNumber, Select, Button, Alert, Tag, Space, Flex, message } from 'antd'
import { BarcodeOutlined, CalendarOutlined, CheckCircleOutlined, InfoCircleOutlined, LockOutlined, SmileOutlined, WarningOutlined } from '@ant-design/icons'
import { useAuth } from '../../../hooks/useAuth'
import { useProcesses, useFormTask, useSampleDefinitions } from '../../../hooks/useProcesses'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

export function SampleReceptionTask({ task, onToggle }) {
  const { user: currentUser } = useAuth()
  const { processInstanceRoles = [] } = useProcesses()
  
  const { 
    samples = [], 
    blindCodes = [], 
    isLoadingSamples, 
    isLoadingBlindCodes 
  } = useSampleDefinitions(task.process_instance_id)

  const { answers = {}, saveAnswers } = useFormTask(null, task.id)
  const [receptions, setReceptions] = useState({})
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)

  useEffect(() => {
    if (answers && answers.receptions) {
      setReceptions(answers.receptions)
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
      ...receptions,
      [sampleId]: {
        ...receptions[sampleId],
        [key]: value
      }
    }
    setReceptions(updated)
    saveAnswers({ instanceTaskId: task.id, answers: { ...answers, receptions: updated } })
  }

  // Get designated blind code for a sample
  const getDesignatedBlindCode = (sampleId) => {
    if (!labRoleId) return null
    const bc = blindCodes.find(bc => Number(bc.sample_id) === Number(sampleId) && Number(bc.laboratory_role_id) === Number(labRoleId))
    return bc ? bc.blind_code : null
  }

  // Business validations for individual sample
  const checkSampleValidation = (sample) => {
    const rec = receptions[sample.id] || {}
    const designatedCode = getDesignatedBlindCode(sample.id)
    
    const isCodeEmpty = !String(rec.blind_code || '').trim()
    const isCodeValid = String(rec.blind_code || '').trim() === String(designatedCode || '').trim()
    const isQuantityValid = rec.quantity_received !== undefined && rec.quantity_received !== null && rec.quantity_received > 0
    const isDateValid = !!rec.received_date
    const isConditionValid = !!rec.conditions

    return {
      isCodeEmpty,
      isCodeValid,
      isQuantityValid,
      isDateValid,
      isConditionValid,
      isValid: isCodeValid && isQuantityValid && isDateValid && isConditionValid
    }
  }

  const isFormValid = samples.length > 0 && samples.every(sample => checkSampleValidation(sample).isValid)

  const handleSubmit = () => {
    setAttemptedSubmit(true)
    if (!isFormValid) {
      message.error('Por favor, certifique-se de que todos os códigos cegos estão corretos e todos os campos obrigatórios estão preenchidos.')
      return
    }

    // Save final answers and toggle task completion
    saveAnswers({ 
      instanceTaskId: task.id, 
      answers: { ...answers, receptions, submitted: true } 
    }, {
      onSuccess: () => {
        onToggle() // completing the task
        message.success('Confirmação de recebimento registrada com sucesso!')
      },
      onError: () => {
        message.error('Erro ao salvar as respostas.')
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
            message="Tarefa Concluída"
            description="O recebimento das amostras já foi confirmado por este laboratório."
            type="success"
            showIcon
            icon={<CheckCircleOutlined />}
            style={{ borderRadius: '12px' }}
          />
        )}

        <div>
          <Title level={4} style={{ fontFamily: 'Barlow, sans-serif', color: '#014E2A', margin: '0 0 8px 0' }}>
            Confirmação de Recebimento de Materiais
          </Title>
          <Paragraph style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>
            Verifique fisicamente as amostras recebidas, insira o código cego impresso na etiqueta externa e forneça os detalhes abaixo.
          </Paragraph>
        </div>

        <Row gutter={[24, 24]}>
          {samples.map((sample, index) => {
            const rec = receptions[sample.id] || {}
            const validation = checkSampleValidation(sample)
            const designatedCode = getDesignatedBlindCode(sample.id)

            // Validation feedback styles
            const showCodeError = attemptedSubmit || (!validation.isCodeEmpty && !validation.isCodeValid)
            const showQtyError = attemptedSubmit && !validation.isQuantityValid
            const showDateError = attemptedSubmit && !validation.isDateValid
            const showCondError = attemptedSubmit && !validation.isConditionValid

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
                    {/* Left Side: Physical description from planner stage */}
                    <Col xs={24} md={10}>
                      <Space direction="vertical" size={12} style={{ width: '100%' }}>
                        <Flex align="center" gap={8}>
                          <Tag color="cyan" style={{ borderRadius: '6px', fontWeight: 'bold' }}>
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
                              <Text type="secondary">Instruções de Armazenamento: </Text>
                              <Text type="warning" strong>{sample.storage_instructions || 'N/A'}</Text>
                            </div>
                            {task.is_completed && designatedCode && (
                              <div style={{ marginTop: '8px' }}>
                                <Tag icon={<BarcodeOutlined />} color="blue">
                                  CÓDIGO CEGO: {designatedCode}
                                </Tag>
                              </div>
                            )}
                          </Space>
                        </div>
                      </Space>
                    </Col>

                    {/* Right Side: Reception Inputs */}
                    <Col xs={24} md={14}>
                      <Row gutter={[16, 16]}>
                        {/* 1. Blind Code Verification */}
                        <Col xs={24}>
                          <span style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151', fontSize: '13px' }}>
                            Código Cego da Amostra *
                          </span>
                          <Input
                            placeholder="Insira o código cego (ex: XR-3921-K)"
                            prefix={<BarcodeOutlined style={{ color: '#6B7280' }} />}
                            value={rec.blind_code || ''}
                            onChange={(e) => handleChange(sample.id, 'blind_code', e.target.value)}
                            disabled={!canExecute}
                            status={showCodeError ? 'error' : ''}
                            style={{ borderRadius: '12px', height: '40px' }}
                          />
                          {showCodeError && (
                            <Text type="danger" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                              {!rec.blind_code 
                                ? 'O código cego é obrigatório.' 
                                : 'Código cego incorreto. Verifique a etiqueta física.'}
                            </Text>
                          )}
                          {!validation.isCodeEmpty && validation.isCodeValid && (
                            <Text type="success" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                              <CheckCircleOutlined /> Código correspondente verificado!
                            </Text>
                          )}
                        </Col>

                        {/* 2. Received Quantity */}
                        <Col xs={24} sm={12}>
                          <span style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151', fontSize: '13px' }}>
                            Quantidade Recebida *
                          </span>
                          <InputNumber
                            placeholder={`Qtd. em ${sample.unit || 'unidade'}`}
                            min={0}
                            style={{ width: '100%', borderRadius: '12px', height: '40px', lineHeight: '40px' }}
                            value={rec.quantity_received}
                            onChange={(val) => handleChange(sample.id, 'quantity_received', val)}
                            disabled={!canExecute}
                            status={showQtyError ? 'error' : ''}
                            addonAfter={sample.unit || 'ml'}
                          />
                          {showQtyError && (
                            <Text type="danger" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                              Insira uma quantidade maior que zero.
                            </Text>
                          )}
                        </Col>

                        {/* 3. Reception Date */}
                        <Col xs={24} sm={12}>
                          <span style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151', fontSize: '13px' }}>
                            Data do Recebimento *
                          </span>
                          <Input
                            type="date"
                            style={{ borderRadius: '12px', height: '40px' }}
                            value={rec.received_date || ''}
                            onChange={(e) => handleChange(sample.id, 'received_date', e.target.value)}
                            disabled={!canExecute}
                            status={showDateError ? 'error' : ''}
                          />
                          {showDateError && (
                            <Text type="danger" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                              Informe a data de recebimento.
                            </Text>
                          )}
                        </Col>

                        {/* 4. Arrival Conditions */}
                        <Col xs={24}>
                          <span style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151', fontSize: '13px' }}>
                            Condições de Chegada do Material *
                          </span>
                          <Select
                            placeholder="Selecione o estado físico da embalagem"
                            style={{ width: '100%', height: '40px' }}
                            value={rec.conditions}
                            onChange={(val) => handleChange(sample.id, 'conditions', val)}
                            disabled={!canExecute}
                            status={showCondError ? 'error' : ''}
                            options={[
                              { value: 'Adequado', label: '🟢 Adequado (Lacre intacto, temperatura conforme especificado)' },
                              { value: 'Avariado', label: '🟡 Avariado (Amassados ou pequenos danos externos)' },
                              { value: 'Temperatura Incorreta', label: '🟠 Temperatura Incorreta (Fora das especificações de ref/cong)' },
                              { value: 'Vazamento ou Quebra', label: '🔴 Vazamento ou Quebra (Dano físico grave, descarte necessário)' }
                            ]}
                          />
                          {showCondError && (
                            <Text type="danger" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                              Selecione uma das opções de condições de chegada.
                            </Text>
                          )}
                        </Col>

                        {/* 5. Observations */}
                        <Col xs={24}>
                          <span style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151', fontSize: '13px' }}>
                            Observações Gerais do Recebimento (Opcional)
                          </span>
                          <TextArea
                            rows={2}
                            placeholder="Descreva observações, desvios de temperatura ou anomalias no invólucro do material."
                            value={rec.observations || ''}
                            onChange={(e) => handleChange(sample.id, 'observations', e.target.value)}
                            disabled={!canExecute}
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
              Confirmar Recebimento de Amostras
            </Button>
          </Flex>
        )}
      </Space>
    </Card>
  )
}
