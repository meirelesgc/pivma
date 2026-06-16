import { useState } from 'react'
import {
  Table,
  Button,
  Card,
  Typography,
  Space,
  Alert,
  Tag,
  Modal,
  Drawer,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Divider,
  Row,
  Col,
  Upload,
  Progress,
  message,
  Popconfirm,
  Tooltip,
  Flex
} from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  UploadOutlined,
  FilePdfOutlined,
  PrinterOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  LockOutlined,
  BarcodeOutlined,
  WarningOutlined
} from '@ant-design/icons'
import { useAuth } from '../../../hooks/useAuth'
import { useProcesses, useSampleDefinitions } from '../../../hooks/useProcesses'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

// Custom beautiful simulated QR Code component using SVG
function SimulatedQRCode({ value }) {
  return (
    <Tooltip title={`QR Code de Acesso ao SDS: ${value}`}>
      <svg 
        width="110" 
        height="110" 
        viewBox="0 0 100 100" 
        style={{ 
          background: '#fff', 
          padding: '8px', 
          border: '1.5px solid #e8e8e8', 
          borderRadius: '8px', 
          boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
          cursor: 'pointer'
        }}
      >
        {/* Corner Squares */}
        <rect x="0" y="0" width="22" height="22" fill="#1f1f1f" rx="2" />
        <rect x="4" y="4" width="14" height="14" fill="#fff" />
        <rect x="7" y="7" width="8" height="8" fill="#1f1f1f" rx="1" />

        <rect x="78" y="0" width="22" height="22" fill="#1f1f1f" rx="2" />
        <rect x="82" y="4" width="14" height="14" fill="#fff" />
        <rect x="85" y="7" width="8" height="8" fill="#1f1f1f" rx="1" />

        <rect x="0" y="78" width="22" height="22" fill="#1f1f1f" rx="2" />
        <rect x="4" y="82" width="14" height="14" fill="#fff" />
        <rect x="7" y="85" width="8" height="8" fill="#1f1f1f" rx="1" />

        {/* Small center/alignment square */}
        <rect x="68" y="68" width="10" height="10" fill="#1f1f1f" rx="1" />
        <rect x="71" y="71" width="4" height="4" fill="#fff" />

        {/* Simulated noise/dots pattern */}
        <rect x="30" y="4" width="6" height="6" fill="#1f1f1f" />
        <rect x="42" y="8" width="12" height="6" fill="#1f1f1f" />
        <rect x="60" y="2" width="6" height="18" fill="#1f1f1f" />
        
        <rect x="4" y="30" width="6" height="12" fill="#1f1f1f" />
        <rect x="16" y="42" width="12" height="6" fill="#1f1f1f" />
        <rect x="22" y="58" width="6" height="6" fill="#1f1f1f" />
        
        <rect x="32" y="32" width="18" height="18" fill="#1f1f1f" />
        <rect x="38" y="38" width="6" height="6" fill="#fff" />
        
        <rect x="58" y="38" width="14" height="6" fill="#1f1f1f" />
        <rect x="52" y="52" width="6" height="12" fill="#1f1f1f" />
        <rect x="68" y="58" width="8" height="8" fill="#1f1f1f" />
        
        <rect x="32" y="62" width="6" height="16" fill="#1f1f1f" />
        <rect x="44" y="72" width="16" height="6" fill="#1f1f1f" />
        <rect x="58" y="78" width="6" height="16" fill="#1f1f1f" />
        
        <rect x="78" y="32" width="12" height="12" fill="#1f1f1f" />
        <rect x="84" y="48" width="6" height="14" fill="#1f1f1f" />
        <rect x="80" y="78" width="14" height="6" fill="#1f1f1f" />
      </svg>
    </Tooltip>
  )
}

export function SampleDefinitionTask({ task, onToggle }) {
  const { user: currentUser } = useAuth()
  const {
    processInstanceRoles = [],
    pendingInvites = []
  } = useProcesses()

  const {
    samples,
    isLoadingSamples,
    blindCodes,
    isLoadingBlindCodes,
    saveSamples,
    isSavingSamples
  } = useSampleDefinitions(task.process_instance_id)

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingSample, setEditingSample] = useState(null)
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false)
  const [form] = Form.useForm()

  // Simulating SDS file upload state
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadingFile, setUploadingFile] = useState(null)

  // 1. Dependency Check
  // Check if at least one Participant Laboratory is defined in the previous step
  const activeLabRoles = processInstanceRoles.filter(
    r => Number(r.instance_id) === Number(task.process_instance_id) && r.role === 'Laboratórios Participantes'
  )
  const activePendingLabInvites = pendingInvites.filter(
    i => Number(i.process_instance_id) === Number(task.process_instance_id) && i.target_role === 'Laboratórios Participantes' && i.status === 'sent'
  )
  const totalLabs = activeLabRoles.length + activePendingLabInvites.length
  const isBlockedByDependency = totalLabs === 0

  // 2. User Roles Analysis
  const userRoles = processInstanceRoles
    .filter(r => r.instance_id === task.process_instance_id && r.user_id === currentUser?.id)
    .map(r => r.role.toLowerCase())

  const isSampleGroup = userRoles.includes('grupo de seleção de amostras')
  const isLabParticipant = userRoles.includes('laboratórios participantes')
  const isAdmin = currentUser?.system_role === 'admin'

  const canExecute = (isSampleGroup || isAdmin) && !task.is_completed

  // 3. SDS & Blind Codes states for label generation
  const allSamplesHaveSDS = samples.length > 0 && samples.every(s => s.sds_file || s.sds_url)
  // Check if blind codes have been generated for all combinations of samples and registered labs
  const expectedBlindCodesCount = samples.length * activeLabRoles.length
  const allBlindCodesGenerated = samples.length > 0 && blindCodes.length >= expectedBlindCodesCount

  const canGenerateLabels = allSamplesHaveSDS && allBlindCodesGenerated

  // Handle Form Open for Add/Edit
  const handleOpenDrawer = (sample = null) => {
    setEditingSample(sample)
    setUploadingFile(sample?.sds_file ? { name: sample.sds_file } : null)
    setUploadProgress(sample?.sds_file ? 100 : 0)

    if (sample) {
      form.setFieldsValue({
        ...sample,
        is_mixture: sample.components && sample.components.length > 0
      })
    } else {
      form.resetFields()
      form.setFieldsValue({
        is_mixture: false,
        components: [],
        test_concentrations: [],
        chemical_class: [],
        product_class: []
      })
    }
    setIsDrawerOpen(true)
  }

  // Handle Save Sample
  const handleSaveSample = async () => {
    try {
      const values = await form.validateFields()
      
      const newSample = {
        ...editingSample,
        chemical_name: values.chemical_name,
        casrn: values.casrn,
        chemical_class: values.chemical_class || [],
        product_class: values.product_class || [],
        appearance: values.appearance || '',
        physical_state: values.physical_state || '',
        quantity: values.quantity || 0,
        unit: values.unit || '',
        ph: values.ph !== undefined ? values.ph : null,
        kow: values.kow !== undefined ? values.kow : null,
        volatility: values.volatility || '',
        reactivity: values.reactivity || '',
        test_concentrations: values.test_concentrations || [],
        purity_percentage: values.purity_percentage !== undefined ? values.purity_percentage : null,
        supplier: values.supplier || '',
        storage_instructions: values.storage_instructions || '',
        handling_instructions: values.handling_instructions || '',
        disposal_instructions: values.disposal_instructions || '',
        components: values.is_mixture ? values.components || [] : [],
        sds_file: uploadingFile?.name || '',
        sds_url: uploadingFile ? `/mock/sds/${uploadingFile.name}` : ''
      }

      let updatedSamplesList
      if (editingSample) {
        updatedSamplesList = samples.map(s => s.id === editingSample.id ? newSample : s)
      } else {
        updatedSamplesList = [...samples, { ...newSample, id: undefined }] // database assigns ID
      }

      saveSamples({
        instanceId: task.process_instance_id,
        samples: updatedSamplesList
      }, {
        onSuccess: () => {
          message.success('Amostra salva com sucesso e códigos cegos atualizados!')
          setIsDrawerOpen(false)
        },
        onError: () => {
          message.error('Erro ao salvar amostra.')
        }
      })
    } catch (e) {
      console.log('Validations failed', e)
    }
  }

  // Handle Delete Sample
  const handleDeleteSample = (sampleId) => {
    const updatedSamplesList = samples.filter(s => s.id !== sampleId)
    saveSamples({
      instanceId: task.process_instance_id,
      samples: updatedSamplesList
    }, {
      onSuccess: () => {
        message.success('Amostra excluída com sucesso!')
      },
      onError: () => {
        message.error('Erro ao excluir amostra.')
      }
    })
  }

  // Mock file upload handler
  const handleMockUpload = ({ file, onSuccess }) => {
    setUploadingFile(file)
    setUploadProgress(0)
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          onSuccess("ok")
          message.success(`Documento SDS ${file.name} anexado com sucesso (Mock)!`)
          return 100
        }
        return prev + 25
      })
    }, 400)
  }

  // Finalize / Toggle Task Completion
  const handleToggleTaskStatus = () => {
    if (task.is_completed) {
      onToggle() // notifies method details to reopen
    } else {
      if (samples.length === 0) {
        message.error('É necessário cadastrar pelo menos uma amostra.')
        return
      }
      if (!allSamplesHaveSDS) {
        message.error('Todas as amostras cadastradas devem possuir um SDS associado.')
        return
      }
      onToggle() // completes
    }
  }

  // PRINT labels helper
  const handlePrintLabels = () => {
    const printContent = document.getElementById('label-print-area').innerHTML
    
    // Simple custom print window to avoid messy layout changes
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>Imprimir Etiquetas de Envio</title>
          <style>
            body { font-family: 'Lexend', sans-serif; padding: 20px; }
            .label-sheet { display: flex; flex-wrap: wrap; gap: 20px; justify-content: center; }
            .label-card {
              width: 320px;
              border: 2px dashed #000;
              padding: 15px;
              border-radius: 8px;
              background-color: #fff;
              page-break-inside: avoid;
            }
            .label-title { font-size: 16px; font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
            .label-detail { font-size: 12px; margin-bottom: 6px; }
            .label-code { font-size: 20px; font-weight: bold; color: #111; letter-spacing: 1px; text-align: center; margin: 10px 0; border: 1.5px solid #000; padding: 6px; border-radius: 4px; }
            .qr-container { display: flex; justify-content: center; margin-top: 10px; }
          </style>
        </head>
        <body onload="window.print();window.close();">
          <div class="label-sheet">
            ${printContent}
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  // BLOCKED STATE VIEW
  if (isBlockedByDependency) {
    return (
      <Alert
        message="Tarefa Bloqueada"
        description="Esta tarefa não pode ser iniciada porque nenhum Laboratório Participante foi cadastrado. Por favor, adicione pelo menos um laboratório participante na tarefa de atribuição correspondente."
        type="warning"
        showIcon
        icon={<LockOutlined />}
        style={{ borderRadius: '12px' }}
      />
    )
  }

  // RENDER PARTICIPANT VIEW (Secure distribution - Blind)
  if (isLabParticipant && !isAdmin && !isSampleGroup) {
    // Determine the participant lab role entry for the current user
    const userLabRole = activeLabRoles.find(r => r.user_id === currentUser.id)
    if (!userLabRole) {
      return (
        <Alert
          message="Acesso Cego"
          description="Você é um Laboratório Participante nesta etapa. Contudo, seu usuário ainda não foi associado a um papel ativo na instância."
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          style={{ borderRadius: '12px' }}
        />
      )
    }

    // Filter codes belonging specifically to this laboratory
    const myBlindCodes = blindCodes.filter(bc => bc.laboratory_role_id === userLabRole.id)

    const columns = [
      {
        title: 'Código Cego',
        dataIndex: 'blind_code',
        key: 'blind_code',
        render: (code) => <Tag color="geekblue" style={{ fontSize: '14px', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold' }}>{code}</Tag>
      },
      {
        title: 'Estudo',
        key: 'study',
        render: () => <Text strong>BRA-2026-{task.process_instance_id}</Text>
      },
      {
        title: 'Ficha SDS / Segurança',
        key: 'sds',
        render: (_, record) => {
          const sample = samples.find(s => s.id === record.sample_id)
          if (!sample || (!sample.sds_file && !sample.sds_url)) {
            return <Tag color="warning">Indisponível</Tag>
          }
          return (
            <Button
              type="link"
              icon={<FilePdfOutlined />}
              href={sample.sds_url}
              target="_blank"
              style={{ padding: 0 }}
            >
              Baixar SDS (PDF)
            </Button>
          )
        }
      },
      {
        title: 'Etiqueta de Envio',
        key: 'label',
        render: (_, record) => {
          const sample = samples.find(s => s.id === record.sample_id)
          const sdsUrl = sample?.sds_url || '#'
          return (
            <Button
              type="default"
              size="small"
              icon={<PrinterOutlined />}
              onClick={() => {
                Modal.info({
                  title: 'Etiqueta de Envio - Amostra',
                  width: 400,
                  content: (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px', border: '1px dashed #d9d9d9', borderRadius: '8px', marginTop: '16px' }}>
                      <Text style={{ fontSize: '14px', fontWeight: 'bold', color: '#595959' }}>Estudo: BRA-2026-{task.process_instance_id}</Text>
                      <Text style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>Destinatário: {currentUser.name}</Text>
                      <div style={{ fontSize: '22px', fontWeight: 'bold', letterSpacing: '1px', border: '2px solid #262626', padding: '6px 20px', borderRadius: '6px', margin: '16px 0', background: '#fafafa' }}>
                        {record.blind_code}
                      </div>
                      <SimulatedQRCode value={sdsUrl} />
                      <Text type="secondary" style={{ fontSize: '11px', marginTop: '8px' }}>Escaneie para acessar o documento SDS</Text>
                    </div>
                  ),
                  okText: 'Fechar'
                })
              }}
            >
              Visualizar Etiqueta
            </Button>
          )
        }
      }
    ]

    return (
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <Alert
          message="Distribuição Cega Ativa"
          description="Você está visualizando as informações em modo cego. O nome químico, CASRN e demais caracterizações físicas das substâncias originais são omitidos para preservar a integridade do estudo."
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          style={{ borderRadius: '12px' }}
        />
        <Table
          dataSource={myBlindCodes}
          columns={columns}
          rowKey="id"
          pagination={false}
          loading={isLoadingBlindCodes || isLoadingSamples}
          bordered
          style={{ borderRadius: '8px', overflow: 'hidden' }}
        />
      </Space>
    )
  }

  // RENDER EXECUTION VIEW (Grupo de Seleção de Amostras / Admin)
  return (
    <Space direction="vertical" size={20} style={{ width: '100%' }}>
      <Paragraph style={{ fontFamily: 'Lexend, sans-serif', color: '#595959', margin: 0 }}>
        Gerencie as amostras químicas associadas a esta validação de método. Defina caracterizações físico-químicas, anexe os respectivos SDS e gere os códigos cegos e etiquetas de envio para os laboratórios.
      </Paragraph>

      {/* Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          {canExecute && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleOpenDrawer()}
              style={{ borderRadius: '8px', fontWeight: 'bold' }}
            >
              Adicionar Amostra
            </Button>
          )}
          <Button
            type="default"
            icon={<BarcodeOutlined />}
            onClick={() => setIsLabelModalOpen(true)}
            disabled={!canGenerateLabels}
            style={{ borderRadius: '8px' }}
          >
            Visualizar Etiquetas ({blindCodes.length})
          </Button>
        </Space>

        {!canGenerateLabels && canExecute && (
          <Text type="secondary" style={{ fontSize: '12px' }}>
            <WarningOutlined style={{ color: '#fa8c16', marginRight: '4px' }} />
            Anexe SDS em todas as amostras para habilitar as etiquetas.
          </Text>
        )}
      </div>

      {/* Samples Table */}
      <Table
        dataSource={samples}
        rowKey="id"
        loading={isLoadingSamples || isLoadingBlindCodes}
        pagination={false}
        bordered
        style={{ borderRadius: '12px', overflow: 'hidden' }}
        columns={[
          {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 60,
            render: (id) => <Text type="secondary">#{id}</Text>
          },
          {
            title: 'Substância / CASRN',
            key: 'name_cas',
            render: (_, record) => (
              <Flex vertical>
                <Text strong>{record.chemical_name}</Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>CASRN: {record.casrn}</Text>
              </Flex>
            )
          },
          {
            title: 'Características Físicas',
            key: 'physics',
            render: (_, record) => (
              <Flex vertical gap={2}>
                <Text style={{ fontSize: '13px' }}><strong>Estado:</strong> {record.physical_state || '-'}</Text>
                <Text style={{ fontSize: '13px' }}><strong>Qtd:</strong> {record.quantity} {record.unit}</Text>
              </Flex>
            )
          },
          {
            title: 'Classes',
            key: 'classes',
            render: (_, record) => (
              <Space wrap size={[4, 4]}>
                {record.chemical_class?.map(c => <Tag color="blue" key={c}>{c}</Tag>)}
                {record.product_class?.map(p => <Tag color="green" key={p}>{p}</Tag>)}
              </Space>
            )
          },
          {
            title: 'Documento SDS',
            key: 'sds',
            render: (_, record) => {
              if (!record.sds_file && !record.sds_url) {
                return <Tag color="error">Sem SDS</Tag>
              }
              return (
                <Space>
                  <FilePdfOutlined style={{ color: '#ff4d4f' }} />
                  <a href={record.sds_url} target="_blank" rel="noreferrer" style={{ fontSize: '13px' }}>
                    {record.sds_file || 'Visualizar'}
                  </a>
                </Space>
              )
            }
          },
          {
            title: 'Códigos Cegos',
            key: 'blind_codes',
            render: (_, record) => {
              const codesForSample = blindCodes.filter(bc => bc.sample_id === record.id)
              if (codesForSample.length === 0) {
                return <Text type="secondary" italic style={{ fontSize: '12px' }}>Nenhum gerado</Text>
              }
              return (
                <Space wrap size={[4, 4]}>
                  {codesForSample.map(bc => {
                    const labRole = activeLabRoles.find(l => l.id === bc.laboratory_role_id)
                    const labName = labRole ? `Lab #${labRole.user_id}` : `Lab Role #${bc.laboratory_role_id}`
                    return (
                      <Tooltip title={labName} key={bc.id}>
                        <Tag color="geekblue" style={{ cursor: 'help', fontWeight: 'bold' }}>{bc.blind_code}</Tag>
                      </Tooltip>
                    )
                  })}
                </Space>
              )
            }
          },
          {
            title: 'Ações',
            key: 'actions',
            width: 120,
            render: (_, record) => (
              <Space>
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => handleOpenDrawer(record)}
                  disabled={task.is_completed}
                />
                {canExecute && (
                  <Popconfirm
                    title="Tem certeza que deseja excluir esta amostra?"
                    description="Os códigos cegos associados também serão removidos."
                    onConfirm={() => handleDeleteSample(record.id)}
                    okText="Sim"
                    cancelText="Não"
                  >
                    <Button type="text" danger icon={<DeleteOutlined />} disabled={task.is_completed} />
                  </Popconfirm>
                )}
              </Space>
            )
          }
        ]}
      />

      {/* Task Action Buttons */}
      {canExecute && (
        <Button
          type="primary"
          onClick={handleToggleTaskStatus}
          style={{
            fontFamily: 'Lexend, sans-serif',
            borderRadius: '8px',
            fontWeight: '600',
            backgroundColor: task.is_completed ? '#8c8c8c' : '#52c41a',
            borderColor: task.is_completed ? '#8c8c8c' : '#52c41a'
          }}
          block
        >
          {task.is_completed ? 'Reabrir Cadastro de Amostras' : 'Confirmar e Concluir Cadastro de Amostras'}
        </Button>
      )}

      {/* DRAWER FOR ADD/EDIT SAMPLE */}
      <Drawer
        title={editingSample ? 'Editar Caracterização de Amostra' : 'Adicionar Nova Amostra'}
        width={720}
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
        bodyStyle={{ paddingBottom: 80 }}
        extra={
          <Space>
            <Button onClick={() => setIsDrawerOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveSample} type="primary" loading={isSavingSamples}>Salvar</Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          hideRequiredMark
        >
          {/* Identificação Básica */}
          <Title level={5} style={{ fontFamily: 'Barlow, sans-serif' }}>1. Identificação Básica</Title>
          <Row gutter={16}>
            <Col span={14}>
              <Form.Item
                name="chemical_name"
                label="Nome Químico ou Comercial"
                rules={[{ required: true, message: 'Digite o nome químico' }]}
              >
                <Input placeholder="Ex: Metomil" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item
                name="casrn"
                label="CASRN"
                rules={[{ required: true, message: 'Digite o código CAS' }]}
              >
                <Input placeholder="Ex: 16752-77-5" />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          {/* Classificação */}
          <Title level={5} style={{ fontFamily: 'Barlow, sans-serif' }}>2. Classificação</Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="chemical_class"
                label="Classe Química"
              >
                <Select mode="tags" placeholder="Ex: Carbamato, Fenol" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="product_class"
                label="Classe do Produto"
              >
                <Select mode="tags" placeholder="Ex: Inseticida, Solventes" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          {/* Características Visuais e Físicas */}
          <Title level={5} style={{ fontFamily: 'Barlow, sans-serif' }}>3. Características Visuais e Físicas</Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="appearance"
                label="Aparência"
              >
                <Input placeholder="Ex: Sólido cristalino branco" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="physical_state"
                label="Estado Físico"
              >
                <Select placeholder="Selecione o estado físico">
                  <Select.Option value="Sólido">Sólido</Select.Option>
                  <Select.Option value="Líquido">Líquido</Select.Option>
                  <Select.Option value="Gasoso">Gasoso</Select.Option>
                  <Select.Option value="Semissólido">Semissólido</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="quantity"
                label="Quantidade Enviada"
              >
                <InputNumber min={0} style={{ width: '100%' }} placeholder="Ex: 500" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="unit"
                label="Unidade de Medida"
              >
                <Select placeholder="Unidade">
                  <Select.Option value="g">g (gramas)</Select.Option>
                  <Select.Option value="kg">kg (quilogramas)</Select.Option>
                  <Select.Option value="mg">mg (miligramas)</Select.Option>
                  <Select.Option value="ml">ml (mililitros)</Select.Option>
                  <Select.Option value="L">L (litros)</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          {/* Dados Físico-Químicos */}
          <Title level={5} style={{ fontFamily: 'Barlow, sans-serif' }}>4. Dados Físico-Químicos</Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="ph"
                label="pH"
              >
                <InputNumber min={0} max={14} step={0.1} style={{ width: '100%' }} placeholder="Ex: 6.5" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="kow"
                label="Coeficiente Kow"
              >
                <InputNumber step={0.01} style={{ width: '100%' }} placeholder="Ex: 0.6" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="volatility"
                label="Volatilidade"
              >
                <Input placeholder="Ex: Baixa pressão de vapor" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="reactivity"
                label="Reatividade"
              >
                <Input placeholder="Ex: Estável em pH neutro" />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          {/* Especificações do Teste */}
          <Title level={5} style={{ fontFamily: 'Barlow, sans-serif' }}>5. Especificações do Teste</Title>
          <Form.Item
            name="test_concentrations"
            label="Concentrações de Teste Recomendadas"
          >
            <Select mode="tags" placeholder="Pressione Enter para adicionar concentrações (Ex: 0.1%, 1%, 10%)" style={{ width: '100%' }} />
          </Form.Item>

          <Divider />

          {/* Qualidade e Origem */}
          <Title level={5} style={{ fontFamily: 'Barlow, sans-serif' }}>6. Qualidade e Origem</Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="purity_percentage"
                label="Grau de Pureza (%)"
              >
                <InputNumber min={0} max={100} step={0.1} style={{ width: '100%' }} placeholder="Ex: 98.5" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="supplier"
                label="Fornecedor"
              >
                <Input placeholder="Ex: Sigma-Aldrich" />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          {/* Estabilidade e Segurança */}
          <Title level={5} style={{ fontFamily: 'Barlow, sans-serif' }}>7. Estabilidade e Segurança</Title>
          <Form.Item
            name="storage_instructions"
            label="Instruções de Armazenamento"
          >
            <TextArea rows={2} placeholder="Ex: Manter sob congelamento a -20°C, ao abrigo da luz." />
          </Form.Item>
          <Form.Item
            name="handling_instructions"
            label="Instruções de Manuseio"
          >
            <TextArea rows={2} placeholder="Ex: Manipular em capela de exaustão usando luvas de nitrilo." />
          </Form.Item>
          <Form.Item
            name="disposal_instructions"
            label="Instruções de Descarte / Resíduo"
          >
            <TextArea rows={2} placeholder="Ex: Descartar como resíduo perigoso classe I (químico)." />
          </Form.Item>

          <Divider />

          {/* Misturas */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Title level={5} style={{ fontFamily: 'Barlow, sans-serif', margin: 0 }}>8. Composição de Mistura</Title>
            <Form.Item name="is_mixture" valuePropName="checked" noStyle>
              <Switch checkedChildren="Mistura" unCheckedChildren="Substância Pura" />
            </Form.Item>
          </div>

          <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.is_mixture !== currentValues.is_mixture} noStyle>
            {({ getFieldValue }) => {
              const isMixture = getFieldValue('is_mixture')
              if (!isMixture) return null
              return (
                <Card size="small" style={{ backgroundColor: '#fafafa', borderRadius: '8px' }}>
                  <Form.List name="components">
                    {(fields, { add, remove }) => (
                      <Space direction="vertical" style={{ width: '100%' }} size={12}>
                        {fields.map(({ key, name, ...restField }) => (
                          <Row gutter={8} key={key} align="middle">
                            <Col span={12}>
                              <Form.Item
                                {...restField}
                                name={[name, 'name']}
                                rules={[{ required: true, message: 'Nome do componente' }]}
                                noStyle
                              >
                                <Input placeholder="Nome do componente" />
                              </Form.Item>
                            </Col>
                            <Col span={10}>
                              <Form.Item
                                {...restField}
                                name={[name, 'concentration']}
                                rules={[{ required: true, message: 'Concentração' }]}
                                noStyle
                              >
                                <Input placeholder="Ex: 25% ou 50 mg/L" />
                              </Form.Item>
                            </Col>
                            <Col span={2}>
                              <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)} />
                            </Col>
                          </Row>
                        ))}
                        <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block>
                          Adicionar Componente da Mistura
                        </Button>
                      </Space>
                    )}
                  </Form.List>
                </Card>
              )
            }}
          </Form.Item>

          <Divider />

          {/* Documento SDS */}
          <Title level={5} style={{ fontFamily: 'Barlow, sans-serif' }}>9. Documento SDS (Ficha de Informação de Segurança)</Title>
          <div style={{ padding: '16px', border: '1.5px dashed #d9d9d9', borderRadius: '8px', backgroundColor: '#fafafa' }}>
            <Upload
              customRequest={handleMockUpload}
              showUploadList={false}
              accept=".pdf"
            >
              <Button icon={<UploadOutlined />} type="default">
                Selecionar e Enviar SDS (PDF)
              </Button>
            </Upload>
            
            {uploadingFile && (
              <div style={{ marginTop: '16px' }}>
                <Space style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <Space>
                    <FilePdfOutlined style={{ color: '#ff4d4f', fontSize: '18px' }} />
                    <Text strong>{uploadingFile.name}</Text>
                  </Space>
                  {uploadProgress === 100 && (
                    <Tag color="success" icon={<CheckCircleOutlined />}>Anexado</Tag>
                  )}
                </Space>
                <Progress percent={uploadProgress} size="small" status={uploadProgress === 100 ? 'success' : 'active'} />
              </div>
            )}
          </div>
        </Form>
      </Drawer>

      {/* LABELS PRINT MODAL */}
      <Modal
        title="Etiquetas de Envio das Amostras"
        open={isLabelModalOpen}
        onCancel={() => setIsLabelModalOpen(false)}
        width={780}
        footer={[
          <Button key="close" onClick={() => setIsLabelModalOpen(false)}>Fechar</Button>,
          <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={handlePrintLabels}>Imprimir Etiquetas</Button>
        ]}
      >
        <div style={{ maxHeight: '550px', overflowY: 'auto', padding: '16px' }}>
          <div id="label-print-area" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
            {blindCodes.map(bc => {
              const sample = samples.find(s => s.id === bc.sample_id)
              const labRole = activeLabRoles.find(l => l.id === bc.laboratory_role_id)
              
              // Map user name if exists
              const labName = labRole ? `Laboratório Participante #${labRole.user_id}` : `Laboratório Role #${bc.laboratory_role_id}`
              const sdsUrl = sample?.sds_url || '#'
              
              return (
                <div 
                  className="label-card"
                  key={bc.id}
                  style={{
                    width: '300px',
                    border: '2px dashed #000',
                    padding: '16px',
                    borderRadius: '8px',
                    backgroundColor: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  }}
                >
                  <div className="label-title" style={{ width: '100%', fontSize: '15px', fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '6px', textAlign: 'center', color: '#333' }}>
                    Estudo: BRA-2026-{task.process_instance_id}
                  </div>
                  <div className="label-detail" style={{ width: '100%', fontSize: '12px', color: '#555', marginTop: '8px', textAlign: 'center' }}>
                    <strong>Destinatário:</strong> {labName}
                  </div>
                  <div className="label-code" style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '1px', border: '1.5px solid #000', padding: '6px 16px', borderRadius: '4px', margin: '12px 0', backgroundColor: '#fafafa', width: '80%', textAlign: 'center' }}>
                    {bc.blind_code}
                  </div>
                  <div className="qr-container">
                    <SimulatedQRCode value={sdsUrl} />
                  </div>
                  <div style={{ fontSize: '9px', color: '#888', marginTop: '6px', textAlign: 'center' }}>
                    Escaneie para acessar o SDS
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Modal>
    </Space>
  )
}
