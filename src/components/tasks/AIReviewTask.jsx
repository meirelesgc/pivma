import React from 'react'
import {
  Typography,
  Button,
  Space,
  Card,
  Tag,
  Divider,
  Flex,
  Input,
  Form,
  Drawer,
  Alert,
  Skeleton,
  List,
  message
} from 'antd'
import {
  RobotOutlined,
  LikeOutlined,
  DislikeOutlined,
  AlertOutlined,
  FileOutlined,
  InfoCircleOutlined,
  EditOutlined
} from '@ant-design/icons'
import {
  useCompleteTask,
  useUpdateTaskInstance,
  useLogProcessEvent,
  useDocuments,
  useTaskInstanceByProcessAndTask,
  useFieldFeedbacks,
  useCreateFieldFeedback,
  useDeleteFeedbacksByTaskInstance
} from '../../hooks/useTasks'
import { useFormResponses, useSubmitFormResponse } from '../../hooks/useForms'
import { useAuth } from '../../hooks/useAuth'

const { Title, Paragraph, Text } = Typography
const { TextArea } = Input

export function AIReviewTask({ task, taskInstance, processId }) {
  const { user } = useAuth()
  const [form] = Form.useForm()

  const [analyzing, setAnalyzing] = React.useState(false)
  const [result, setResult] = React.useState(taskInstance.result || null)
  const [justification, setJustification] = React.useState(taskInstance.contestation_justification || '')
  const [showContestForm, setShowContestForm] = React.useState(false)

  // Controle do Drawer de ajuda
  const [drawerVisible, setDrawerVisible] = React.useState(false)
  const [activeFeedback, setActiveFeedback] = React.useState(null)

  // Carregar respostas do formulário
  const { data: responses, isLoading: isLoadingResponses } = useFormResponses(processId)
  
  // Obter documentos associados (Task 2 é upload)
  const { data: uploadInstance } = useTaskInstanceByProcessAndTask(processId, 2)
  const { data: documents, isLoading: isLoadingDocs } = useDocuments(uploadInstance?.id)

  // Obter feedbacks salvos no banco de dados para este processo
  const { data: feedbacks, isLoading: isLoadingFeedbacks } = useFieldFeedbacks(processId)

  const completeTaskMutation = useCompleteTask()
  const updateTaskInstanceMutation = useUpdateTaskInstance()
  const logEventMutation = useLogProcessEvent()
  const submitFormMutation = useSubmitFormResponse()
  const createFeedbackMutation = useCreateFieldFeedback()
  const deleteFeedbacksMutation = useDeleteFeedbacksByTaskInstance()

  const form1Responses = responses?.filter(r => r.form_id === 1) || []
  const latestResponseObj = form1Responses[form1Responses.length - 1]
  const generalDataResponse = latestResponseObj?.responses || {}

  // Iniciar formulário com as últimas respostas
  React.useEffect(() => {
    if (generalDataResponse) {
      form.setFieldsValue(generalDataResponse)
    }
  }, [responses, form, generalDataResponse])

  const runAnalysis = (updatedValues = null, forceReeval = false) => {
    setAnalyzing(true)
    setResult(null)

    const valuesToEval = updatedValues || form.getFieldsValue()
    const isReevaluation = forceReeval || taskInstance.reevaluated || false

    setTimeout(async () => {
      let aiResult
      let generatedFeedbacks = []

      // 1. Limpar feedbacks antigos gerados por esta instância de tarefa no banco
      await deleteFeedbacksMutation.mutateAsync(taskInstance.id)

      // Na primeira execução, a IA sempre retorna com pendências (Requisito 3)
      if (!isReevaluation) {
        aiResult = {
          score: 65,
          status: 'pending_correction',
          message: 'Foram encontradas pendências na documentação e dados gerais do método.'
        }
        
        generatedFeedbacks = [
          {
            field_name: 'objective',
            type: 'inconsistency',
            title: 'Falta de Termos Técnicos no Objetivo',
            description: 'A IA do BraCVAM analisou o objetivo do método e identificou que termos chaves essenciais para a contextualização regulatória não foram declarados. Métodos alternativos submetidos ao centro precisam conter clareza sobre o escopo de aplicação (ex: se é um teste de toxicidade, irritação dérmica, corrosão ocular) e referenciar as palavras-chave do protocolo.',
            tip: 'Tente reescrever o objetivo incluindo termos como "protocolo", "validação" ou "controle". Exemplo: "Este protocolo visa a validação do método alternativo de irritabilidade cutânea in vitro com controle de qualidade..."'
          },
          {
            field_name: 'description',
            type: 'inconsistency',
            title: 'Descrição Técnica Insuficiente',
            description: 'A descrição técnica apresentada está muito curta ou superficial. A triagem automática requer que o proponente explique detalhadamente a base científica do método, a preparação dos tecidos ou reagentes, o modelo de predição e os critérios de aceitação do teste.',
            tip: 'Escreva uma descrição detalhada com pelo menos 500 caracteres, abordando o passo a passo metodológico, a linhagem celular utilizada ou sistema in vitro, os controles positivo/negativo e o modelo de predição matemática.'
          }
        ]
      } else {
        // Nas reavaliações, avalia o texto digitado
        const objText = valuesToEval.objective || ''
        const descText = valuesToEval.description || ''

        const hasKeywords = ['validação', 'validacao', 'protocolo', 'controle'].some(kw =>
          objText.toLowerCase().includes(kw)
        )
        const isLongEnough = descText.length >= 500

        if (hasKeywords && isLongEnough) {
          aiResult = {
            score: 100,
            status: 'success',
            message: 'A documentação fornecida está em total conformidade com os requisitos e regras do BraCVAM.'
          }
        } else {
          if (!hasKeywords) {
            generatedFeedbacks.push({
              field_name: 'objective',
              type: 'inconsistency',
              title: 'Falta de Termos Técnicos no Objetivo',
              description: 'A IA do BraCVAM analisou o objetivo do método e identificou que termos chaves essenciais para a contextualização regulatória não foram declarados. Métodos alternativos submetidos ao centro precisam conter clareza sobre o escopo de aplicação (ex: se é um teste de toxicidade, irritação dérmica, corrosão ocular) e referenciar as palavras-chave do protocolo.',
              tip: 'Tente reescrever o objetivo incluindo termos como "protocolo", "validação" ou "controle". Exemplo: "Este protocolo visa a validação do método alternativo de irritabilidade cutânea in vitro com controle de qualidade..."'
            })
          }
          if (!isLongEnough) {
            generatedFeedbacks.push({
              field_name: 'description',
              type: 'suggestion',
              title: 'Descrição Técnica Insuficiente',
              description: `A descrição técnica apresentada está muito curta (${descText.length} caracteres). A triagem automática requer uma fundamentação mais robusta.`,
              tip: 'Escreva uma descrição detalhada com pelo menos 500 caracteres, abordando o passo a passo metodológico, a linhagem celular utilizada ou sistema in vitro, os controles positivo/negativo e o modelo de predição matemática.'
            })
          }

          aiResult = {
            score: generatedFeedbacks.length === 2 ? 60 : 80,
            status: 'pending_correction',
            message: 'Foram encontradas pendências na documentação e dados gerais do método.'
          }
        }
      }

      try {
        // Salvar feedbacks gerados no banco de dados
        for (const fb of generatedFeedbacks) {
          await createFeedbackMutation.mutateAsync({
            ...fb,
            process_instance_id: processId,
            task_instance_id: taskInstance.id,
            created_by: 0 // System/IA
          })
        }

        // Salvar resultado e histórico
        await updateTaskInstanceMutation.mutateAsync({
          taskInstanceId: taskInstance.id,
          data: { result: aiResult }
        })

        await logEventMutation.mutateAsync({
          processId,
          userId: user.id,
          type: 'ai_review_completed',
          description: `Avaliação preliminar automatizada (IA) concluída. Score: ${aiResult.score}/100.`
        })

        setResult(aiResult)
        setAnalyzing(false)

        if (aiResult.status === 'success') {
          message.success('Nenhuma pendência encontrada pela IA!')
        } else {
          message.warning('Análise concluída com pendências apontadas.')
        }
      } catch (err) {
        console.error('Erro ao salvar resultado da IA:', err)
        setAnalyzing(false)
        message.error('Erro ao salvar resultado da IA.')
      }
    }, 5000)
  }

  // Disparo automático na montagem do componente (Requisito 1)
  const hasTriggered = React.useRef(false)
  React.useEffect(() => {
    if (responses && !result && !analyzing && !hasTriggered.current) {
      hasTriggered.current = true
      runAnalysis()
    }
  }, [responses, result, analyzing, runAnalysis])

  const handleSaveAndReevaluate = async () => {
    try {
      const values = await form.validateFields()

      // 1. Salvar as novas respostas do formulário
      await submitFormMutation.mutateAsync({
        process_instance_id: processId,
        form_id: 1,
        responses: values,
        user_id: user.id
      })

      // 2. Definir reevaluated como true para que passe a valer a lógica real de validação
      await updateTaskInstanceMutation.mutateAsync({
        taskInstanceId: taskInstance.id,
        data: { reevaluated: true }
      })

      // 3. Rodar análise
      runAnalysis(values, true)
      message.success('Dados salvos. Reiniciando análise...')
    } catch (err) {
      console.error(err)
      message.error('Erro ao salvar dados ou validar formulário.')
    }
  }

  const handleAccept = async () => {
    try {
      await logEventMutation.mutateAsync({
        processId,
        userId: user.id,
        type: 'approval',
        description: 'Usuário aceitou a avaliação da IA. Processo encaminhado para análise da BRACVAM.'
      })

      await updateTaskInstanceMutation.mutateAsync({
        taskInstanceId: taskInstance.id,
        data: { accepted: true }
      })

      await completeTaskMutation.mutateAsync({
        taskInstanceId: taskInstance.id,
        userId: user.id
      })
      message.success('Avaliação aceita. Processo encaminhado para a BRACVAM.')
    } catch (error) {
      console.error(error)
      message.error('Erro ao processar aceitação.')
    }
  }

  const handleContest = async () => {
    if (!justification.trim()) {
      message.warning('Por favor, informe uma justificativa para a contestação.')
      return
    }

    try {
      await logEventMutation.mutateAsync({
        processId,
        userId: user.id,
        type: 'contestation',
        description: `Usuário contestou a avaliação da IA. Justificativa: ${justification.trim()}`
      })

      await updateTaskInstanceMutation.mutateAsync({
        taskInstanceId: taskInstance.id,
        data: {
          accepted: false,
          contestation_justification: justification.trim()
        }
      })

      await completeTaskMutation.mutateAsync({
        taskInstanceId: taskInstance.id,
        userId: user.id
      })
      message.success('Contestação enviada com sucesso. Processo encaminhado para a BRACVAM.')
    } catch (error) {
      console.error(error)
      message.error('Erro ao enviar contestação.')
    }
  }

  // Filtrar feedbacks gerados pela IA (created_by === 0)
  const iaFeedbacks = feedbacks?.filter(f => f.task_instance_id === taskInstance.id && f.created_by === 0) || []

  const openDrawer = (fieldName) => {
    const fb = iaFeedbacks.find(f => f.field_name === fieldName)
    if (fb) {
      setActiveFeedback(fb)
      setDrawerVisible(true)
    }
  }

  const renderFieldLabel = (label, fieldName) => {
    const fb = iaFeedbacks.find(f => f.field_name === fieldName)
    if (!fb) return label

    const isSuggestion = fb.type === 'suggestion'

    return (
      <Space size={4}>
        <span>{label}</span>
        <AlertOutlined
          style={{ color: isSuggestion ? 'var(--ant-info-color, #1890ff)' : 'var(--ant-warning-color, #d48806)', cursor: 'pointer' }}
          onClick={() => openDrawer(fieldName)}
        />
        <Text
          type={isSuggestion ? 'secondary' : 'warning'}
          style={{ fontSize: '11px', cursor: 'pointer', textDecoration: 'underline' }}
          onClick={() => openDrawer(fieldName)}
        >
          {isSuggestion ? 'Sugestão IA (Clique para ver)' : 'Pendência IA (Clique para ver)'}
        </Text>
      </Space>
    )
  }

  const isLoading = isLoadingResponses || isLoadingDocs || isLoadingFeedbacks

  if (isLoading) {
    return <Skeleton active paragraph={{ rows: 8 }} />
  }

  return (
    <div className="ai-review-task">
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>{task.name}</Title>
          <Paragraph type="secondary">
            Triagem automatizada preliminar dos dados e documentos da submissão.
          </Paragraph>
        </div>

        {analyzing && (
          <Card bordered={false} style={{ background: 'var(--background-secondary)', textAlign: 'center', padding: '40px', borderRadius: 'var(--radius-l)' }}>
            <RobotOutlined spin style={{ fontSize: '48px', color: 'var(--primary-color)', marginBottom: '16px' }} />
            <Title level={5}>Análise Inteligente em andamento...</Title>
            <Paragraph>A IA está avaliando as regras de submissão do BraCVAM (tempo estimado: 5 segundos).</Paragraph>
          </Card>
        )}

        {!analyzing && result && (
          <Flex vertical gap={24}>
            {result.status === 'success' ? (
              <Alert
                message="Submissão Aprovada na Triagem Automática"
                description={result.message}
                type="success"
                showIcon
                style={{ borderRadius: 'var(--radius-m)' }}
              />
            ) : (
              <Alert
                message="Pendências Encontradas"
                description="Os dados gerais fornecidos não atendem a todas as diretrizes automáticas. Veja abaixo as indicações de alerta nos campos marcados."
                type="warning"
                showIcon
                style={{ borderRadius: 'var(--radius-m)' }}
              />
            )}

            {/* Documentos Enviados (Visualização de Formulário Consolidado) */}
            <Card bordered title="Documentação Submetida" style={{ borderRadius: 'var(--radius-l)' }}>
              {documents && documents.length > 0 ? (
                <List
                  itemLayout="horizontal"
                  dataSource={documents}
                  renderItem={(doc) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<FileOutlined style={{ fontSize: 20, color: 'var(--primary-color)' }} />}
                        title={doc.file_name}
                        description={`Tamanho: ${(doc.file_size / 1024).toFixed(1)} KB`}
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Text type="secondary">Nenhum documento anexado.</Text>
              )}
            </Card>

            {/* Formulário Editável/Consolidado */}
            <Card
              bordered
              title={
                <Space>
                  <EditOutlined />
                  <Text strong>Formulário de Dados Gerais do Método</Text>
                </Space>
              }
              style={{ borderRadius: 'var(--radius-l)' }}
            >
              <Form
                form={form}
                layout="vertical"
                disabled={result.status === 'success'}
              >
                <Form.Item
                  label="Nome do Método"
                  name="method_name"
                  rules={[{ required: true, message: 'Por favor, preencha este campo' }]}
                >
                  <Input placeholder="Digite o nome oficial do método" />
                </Form.Item>

                <Form.Item
                  label={renderFieldLabel('Objetivo', 'objective')}
                  name="objective"
                  rules={[{ required: true, message: 'Por favor, preencha este campo' }]}
                >
                  <TextArea placeholder="Descreva o objetivo principal deste método" rows={4} />
                </Form.Item>

                <Form.Item
                  label={renderFieldLabel('Descrição Detalhada', 'description')}
                  name="description"
                  rules={[{ required: true, message: 'Por favor, preencha este campo' }]}
                >
                  <TextArea placeholder="Forneça uma descrição técnica detalhada" rows={6} />
                </Form.Item>
              </Form>
            </Card>

            {/* Painel de Ações */}
            {result.status === 'success' ? (
              <Button
                type="primary"
                size="large"
                icon={<LikeOutlined />}
                onClick={handleAccept}
                loading={completeTaskMutation.isPending}
                style={{ borderRadius: 'var(--radius-m)', height: '48px', alignSelf: 'flex-start' }}
              >
                Aceitar e Encaminhar para BRACVAM
              </Button>
            ) : (
              <Flex vertical gap={16}>
                {!showContestForm ? (
                  <Space size="middle">
                    <Button
                      type="primary"
                      size="large"
                      onClick={handleSaveAndReevaluate}
                      loading={updateTaskInstanceMutation.isPending || analyzing}
                      style={{ borderRadius: 'var(--radius-m)', height: '48px' }}
                    >
                      Salvar Alterações e Reavaliar
                    </Button>
                    <Button
                      danger
                      size="large"
                      icon={<DislikeOutlined />}
                      onClick={() => setShowContestForm(true)}
                      style={{ borderRadius: 'var(--radius-m)', height: '48px' }}
                    >
                      Contestar Análise
                    </Button>
                  </Space>
                ) : (
                  <Space direction="vertical" size={16} style={{ width: '100%', marginTop: '16px' }}>
                    <Divider style={{ margin: '8px 0' }} />
                    <Title level={5} style={{ margin: 0 }}>Justificativa de Contestação</Title>
                    <Paragraph type="secondary">
                      Escreva sua justificativa técnica explicando o porquê de os dados atuais estarem corretos.
                    </Paragraph>
                    <TextArea
                      placeholder="Justificativa para análise manual dos especialistas da BRACVAM..."
                      rows={4}
                      value={justification}
                      onChange={(e) => setJustification(e.target.value)}
                      style={{ borderRadius: 'var(--radius-m)' }}
                    />
                    <Space size="middle">
                      <Button
                        type="primary"
                        danger
                        size="large"
                        onClick={handleContest}
                        loading={completeTaskMutation.isPending}
                        style={{ borderRadius: 'var(--radius-m)' }}
                      >
                        Enviar Contestação e Encaminhar
                      </Button>
                      <Button
                        size="large"
                        onClick={() => {
                          setShowContestForm(false)
                          setJustification('')
                        }}
                        style={{ borderRadius: 'var(--radius-m)' }}
                      >
                        Voltar
                      </Button>
                    </Space>
                  </Space>
                )}
              </Flex>
            )}
          </Flex>
        )}
      </Space>

      {/* Drawer explicativo de erro/pendência carregado do banco de dados */}
      <Drawer
        title={
          <Space>
            <InfoCircleOutlined style={{ color: activeFeedback?.type === 'suggestion' ? 'var(--ant-info-color, #1890ff)' : 'var(--ant-warning-color, #d48806)' }} />
            <span>{activeFeedback ? activeFeedback.title : ''}</span>
          </Space>
        }
        placement="right"
        width={450}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        styles={{ body: { padding: '24px' } }}
      >
        {activeFeedback && (
          <Space direction="vertical" size={24} style={{ width: '100%' }}>
            <div>
              <Text type="secondary" style={{ display: 'block', marginBottom: '8px' }}>Tipo da observação:</Text>
              <Tag color={activeFeedback.type === 'suggestion' ? 'blue' : 'warning'}>
                {activeFeedback.type === 'suggestion' ? 'Sugestão' : 'Inconsistência'}
              </Tag>
            </div>

            <div>
              <Text type="secondary" style={{ display: 'block', marginBottom: '8px' }}>Por que isso ocorreu?</Text>
              <Paragraph style={{ fontSize: '14px', lineHeight: '1.6' }}>
                {activeFeedback.description}
              </Paragraph>
            </div>
            
            {activeFeedback.tip && (
              <Alert
                message="Dica de Correção"
                description={activeFeedback.tip}
                type="warning"
                showIcon
                style={{ borderRadius: 'var(--radius-m)' }}
              />
            )}
            
            <Button 
              type="primary" 
              onClick={() => setDrawerVisible(false)} 
              style={{ borderRadius: 'var(--radius-m)', width: '100%', marginTop: '16px' }}
            >
              Entendido
            </Button>
          </Space>
        )}
      </Drawer>
    </div>
  )
}
