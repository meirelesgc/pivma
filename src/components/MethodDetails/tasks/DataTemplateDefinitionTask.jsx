import { useState } from 'react'
import {
  Table,
  Button,
  Card,
  Typography,
  Space,
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
  message,
  Popconfirm,
  Tooltip,
  Radio,
  Empty,
  Flex
} from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  CopyOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  LockOutlined,
  SlidersOutlined
} from '@ant-design/icons'
import { useAuth } from '../../../hooks/useAuth'
import { useProcesses, useDataTemplates } from '../../../hooks/useProcesses'
import { db } from '../../../services/db' // to fetch columns directly in mock mode

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

const getSystemColumnsForTemplate = (template) => {
  const cols = [
    { name: "laboratory_id", label: "ID do Laboratório", type: "integer", required: true, is_system: true, position: 1000 },
    { name: "operator_name", label: "Nome do Operador", type: "text", required: true, is_system: true, position: 1001 },
    { name: "data_entry_user", label: "Digitador dos Dados", type: "text", required: true, is_system: true, position: 1002 },
    { name: "experiment_date", label: "Data do Experimento", type: "date", required: true, is_system: true, position: 1003 },
    { name: "data_entry_date", label: "Data da Digitação", type: "datetime", required: true, is_system: true, position: 1004 }
  ]
  if (template && template.allow_failed_runs) {
    cols.push({
      name: "execution_status",
      label: "Status de Execução",
      type: "select",
      required: true,
      options: ["completed", "failed", "aborted"],
      is_system: true,
      position: 1005
    })
  }
  return cols
}

export function DataTemplateDefinitionTask({ task, onToggle }) {
  const { user: currentUser } = useAuth()
  const { processInstanceRoles = [] } = useProcesses()
  
  const {
    templates,
    isLoadingTemplates,
    saveTemplateAsync,
    deleteTemplateAsync,
    isSavingTemplate
  } = useDataTemplates(task.process_instance_id)

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [currentTemplate, setCurrentTemplate] = useState(null)
  
  // Columns state for the currently editing template
  const [columnsList, setColumnsList] = useState([])
  const [selectedCol, setSelectedCol] = useState(null)
  const [isColModalOpen, setIsColModalOpen] = useState(false)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState(null)
  const [previewColumns, setPreviewColumns] = useState([])

  const [form] = Form.useForm()
  const [colForm] = Form.useForm()

  // 1. Role / Execution Check
  const userRoles = processInstanceRoles
    .filter(r => r.instance_id === task.process_instance_id && r.user_id === currentUser?.id)
    .map(r => r.role.toLowerCase())

  const isStatistician = userRoles.includes('estatístico') || userRoles.includes('estatistico')
  const isAdmin = currentUser?.system_role === 'admin'
  const canExecute = (isStatistician || isAdmin) && !task.is_completed

  // Open Template Editor (Add/Edit)
  const handleOpenTemplateDrawer = async (template = null) => {
    setCurrentTemplate(template)
    if (template) {
      form.setFieldsValue({
        name: template.name,
        description: template.description,
        allow_failed_runs: template.allow_failed_runs,
        experiments_per_lab: template.replicate_configuration?.experiments_per_lab || 1,
        replicates_per_experiment: template.replicate_configuration?.replicates_per_experiment || 1
      })
      // Fetch columns
      try {
        const cols = db.getDataTemplateColumns(template.id)
        setColumnsList(cols)
      } catch {
        setColumnsList([])
      }
    } else {
      form.resetFields()
      form.setFieldsValue({
        allow_failed_runs: true,
        experiments_per_lab: 3,
        replicates_per_experiment: 5
      })
      setColumnsList([])
    }
    setIsDrawerOpen(true)
  }

  // Duplicate a Template
  const handleDuplicateTemplate = async (template) => {
    try {
      // Fetch columns of the template to duplicate
      const cols = db.getDataTemplateColumns(template.id)
      const newTemplate = {
        name: `${template.name} (Cópia)`,
        description: template.description,
        allow_failed_runs: template.allow_failed_runs,
        replicate_configuration: { ...template.replicate_configuration }
      }
      // Filter out system columns since they are re-added automatically
      const userCols = cols.filter(c => !c.is_system && !String(c.id).startsWith('sys-')).map(c => ({
        ...c,
        id: `temp-${Math.random()}` // temporary ID for the new column objects
      }))

      await saveTemplateAsync({
        instanceId: task.process_instance_id,
        template: newTemplate,
        columns: userCols
      })
      message.success(`Template "${template.name}" duplicado com sucesso!`)
    } catch (err) {
      message.error(err.message || 'Erro ao duplicar template.')
    }
  }

  // Delete a Template
  const handleDeleteTemplate = async (templateId) => {
    try {
      await deleteTemplateAsync(templateId)
      message.success('Template excluído com sucesso!')
    } catch {
      message.error('Erro ao excluir template.')
    }
  }

  // Save Template details and columns
  const handleSaveTemplate = async () => {
    try {
      const values = await form.validateFields()
      const templateData = {
        id: currentTemplate?.id || null,
        name: values.name,
        description: values.description,
        allow_failed_runs: values.allow_failed_runs,
        replicate_configuration: {
          experiments_per_lab: values.experiments_per_lab,
          replicates_per_experiment: values.replicates_per_experiment
        }
      }

      await saveTemplateAsync({
        instanceId: task.process_instance_id,
        template: templateData,
        columns: columnsList
      })
      message.success('Template de dados salvo com sucesso!')
      setIsDrawerOpen(false)
    } catch (err) {
      message.error(err.message || 'Erro ao salvar o template de dados. Verifique a estrutura das colunas.')
    }
  }

  // Open Column Editor Modal (Add/Edit)
  const handleOpenColModal = (col = null) => {
    setSelectedCol(col)
    if (col) {
      colForm.setFieldsValue({
        name: col.name,
        label: col.label,
        type: col.type,
        required: col.required,
        position: col.position,
        dataType: col.is_derived_data ? 'derived' : 'raw',
        source_columns: col.source_columns || [],
        options: col.options || []
      })
    } else {
      colForm.resetFields()
      const nextPosition = columnsList.filter(c => !c.is_system).length > 0
        ? Math.max(...columnsList.filter(c => !c.is_system).map(c => c.position)) + 1
        : 1
      colForm.setFieldsValue({
        required: true,
        position: nextPosition,
        dataType: 'raw',
        options: [],
        source_columns: []
      })
    }
    setIsColModalOpen(true)
  }

  // Save/Add Column to the temporary local list
  const handleSaveColumn = async () => {
    try {
      const values = await colForm.validateFields()
      const isDerived = values.dataType === 'derived'
      
      const newCol = {
        ...selectedCol,
        id: selectedCol?.id || `temp-${Math.random()}`,
        name: values.name,
        label: values.label,
        type: values.type,
        required: values.required,
        position: values.position,
        is_raw_data: !isDerived,
        is_derived_data: isDerived,
        source_columns: isDerived ? values.source_columns || [] : [],
        options: (values.type === 'select' || values.type === 'multiselect') ? values.options || [] : []
      }

      // Check duplicates in memory list before committing (just visual feedback)
      const otherCols = columnsList.filter(c => c.id !== newCol.id)
      if (otherCols.some(c => c.name.trim().toLowerCase() === newCol.name.trim().toLowerCase())) {
        message.error('Já existe uma coluna com esse nome identificador.')
        return
      }
      if (otherCols.some(c => Number(c.position) === Number(newCol.position))) {
        message.error('Já existe uma coluna definida nessa posição.')
        return
      }

      let updatedList
      if (selectedCol) {
        updatedList = columnsList.map(c => c.id === selectedCol.id ? newCol : c)
      } else {
        updatedList = [...columnsList, newCol]
      }
      
      setColumnsList(updatedList.sort((a, b) => a.position - b.position))
      setIsColModalOpen(false)
    } catch (err) {
      console.error(err)
    }
  }

  // Delete Column from the temporary local list
  const handleDeleteColumn = (colId) => {
    const updated = columnsList.filter(c => c.id !== colId)
    setColumnsList(updated.sort((a, b) => a.position - b.position))
  }

  // Open Preview Modal
  const handleOpenPreview = (template) => {
    setPreviewTemplate(template)
    try {
      const cols = db.getDataTemplateColumns(template.id)
      setPreviewColumns(cols)
      setIsPreviewModalOpen(true)
    } catch {
      message.error('Erro ao carregar prévia.')
    }
  }

  // Complete/Reopen Task
  const handleToggleTaskStatus = () => {
    if (task.is_completed) {
      onToggle()
    } else {
      if (templates.length === 0) {
        message.error('É necessário criar pelo menos um template de coleta de dados.')
        return
      }
      onToggle()
    }
  }

  return (
    <Space direction="vertical" size={20} style={{ width: '100%' }}>
      <Paragraph style={{ fontFamily: 'Lexend, sans-serif', color: '#595959', margin: 0 }}>
        Defina os templates e esquemas de dados estatísticos estruturados. As planilhas geradas a partir destes templates servirão para consolidar os resultados de todos os laboratórios e realizar as avaliações padronizadas.
      </Paragraph>

      {/* Toolbar */}
      {canExecute && (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => handleOpenTemplateDrawer()}
          style={{ borderRadius: '8px', fontWeight: 'bold' }}
        >
          Novo Template de Coleta
        </Button>
      )}

      {/* Templates Cards Grid */}
      {isLoadingTemplates ? (
        <Card loading style={{ borderRadius: '12px' }} />
      ) : templates.length === 0 ? (
        <Empty description="Nenhum template de coleta definido ainda." style={{ margin: '24px 0' }} />
      ) : (
        <Row gutter={[16, 16]}>
          {templates.map(tpl => {
            let colsCount
            try {
              colsCount = db.getDataTemplateColumns(tpl.id).length
            } catch {
              colsCount = 0
            }

            return (
              <Col span={12} key={tpl.id}>
                <Card
                  hoverable
                  style={{
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                    border: '1.5px solid #f0f0f0'
                  }}
                  actions={[
                    <Tooltip title="Visualizar Prévia" key="preview">
                      <Button type="text" icon={<EyeOutlined />} onClick={() => handleOpenPreview(tpl)} />
                    </Tooltip>,
                    <Tooltip title={canExecute ? "Editar Esquema" : "Visualizar Esquema"} key="edit">
                      <Button type="text" icon={<EditOutlined />} onClick={() => handleOpenTemplateDrawer(tpl)} />
                    </Tooltip>,
                    <Tooltip title="Duplicar Template" key="duplicate">
                      <Button type="text" icon={<CopyOutlined />} onClick={() => handleDuplicateTemplate(tpl)} disabled={!canExecute} />
                    </Tooltip>,
                    <Tooltip title="Remover Template" key="delete">
                      <Popconfirm
                        title="Deseja mesmo remover este template?"
                        description="Todas as colunas associadas serão excluídas."
                        onConfirm={() => handleDeleteTemplate(tpl.id)}
                        okText="Sim"
                        cancelText="Não"
                        disabled={!canExecute}
                      >
                        <Button type="text" danger icon={<DeleteOutlined />} disabled={!canExecute} />
                      </Popconfirm>
                    </Tooltip>
                  ]}
                >
                  <Card.Meta
                    title={<Text style={{ fontFamily: 'Barlow, sans-serif', fontSize: '16px', fontWeight: 'bold' }}>{tpl.name}</Text>}
                    description={
                      <Space direction="vertical" size={4} style={{ width: '100%', marginTop: '6px' }}>
                        <Text type="secondary" style={{ fontSize: '13px' }}>{tpl.description || 'Sem descrição.'}</Text>
                        <Divider style={{ margin: '8px 0' }} />
                        <Row gutter={8}>
                          <Col span={12}>
                            <Text style={{ fontSize: '12px' }}><strong>Experimentos:</strong> {tpl.replicate_configuration?.experiments_per_lab || 0}</Text>
                          </Col>
                          <Col span={12}>
                            <Text style={{ fontSize: '12px' }}><strong>Réplicas:</strong> {tpl.replicate_configuration?.replicates_per_experiment || 0}</Text>
                          </Col>
                        </Row>
                        <Row gutter={8} style={{ marginTop: '4px' }}>
                          <Col span={12}>
                            <Text style={{ fontSize: '12px' }}><strong>Colunas:</strong> {colsCount}</Text>
                          </Col>
                          <Col span={12}>
                            <Tag color={tpl.allow_failed_runs ? 'blue' : 'default'} style={{ fontSize: '10px', borderRadius: '4px' }}>
                              {tpl.allow_failed_runs ? 'Acompanha falhas' : 'Apenas válidos'}
                            </Tag>
                          </Col>
                        </Row>
                      </Space>
                    }
                  />
                </Card>
              </Col>
            )
          })}
        </Row>
      )}

      {/* Task Completion Action */}
      {canExecute && (
        <Button
          type="primary"
          onClick={handleToggleTaskStatus}
          style={{
            fontFamily: 'Lexend, sans-serif',
            borderRadius: '8px',
            fontWeight: '600',
            backgroundColor: task.is_completed ? '#8c8c8c' : '#52c41a',
            borderColor: task.is_completed ? '#8c8c8c' : '#52c41a',
            marginTop: '16px'
          }}
          block
        >
          {task.is_completed ? 'Reabrir Definição de Templates' : 'Confirmar e Concluir Definição de Templates'}
        </Button>
      )}

      {/* DRAWER TEMPLATE BUILDER */}
      <Drawer
        title={currentTemplate ? 'Editar Template de Coleta' : 'Criar Novo Template'}
        width={800}
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
        bodyStyle={{ paddingBottom: 80 }}
        extra={
          <Space>
            <Button onClick={() => setIsDrawerOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveTemplate} type="primary" loading={isSavingTemplate} disabled={!canExecute}>
              Salvar Template
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" disabled={!canExecute}>
          {/* Identificação e Descrição */}
          <Title level={5} style={{ fontFamily: 'Barlow, sans-serif', margin: '0 0 12px 0' }}>1. Informações Básicas</Title>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item name="name" label="Nome do Template" rules={[{ required: true, message: 'Digite o nome do template.' }]}>
                <Input placeholder="Ex: Medições Fisiológicas" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="allow_failed_runs" label="Permitir Ensaios Fracassados?" valuePropName="checked">
                <Switch checkedChildren="Sim" unCheckedChildren="Não" onChange={(val) => {
                  // If toggled, update local columns preview list to reflect system execution_status addition
                  if (currentTemplate) {
                    const tempTpl = { ...currentTemplate, allow_failed_runs: val }
                    const systemCols = getSystemColumnsForTemplate(tempTpl)
                    const userCols = columnsList.filter(c => !c.is_system)
                    setColumnsList([...userCols, ...systemCols.map(sc => ({ id: `sys-${currentTemplate.id}-${sc.name}`, is_system: true, ...sc }))].sort((a,b) => a.position - b.position))
                  }
                }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="Descrição / Finalidade">
            <TextArea placeholder="Ex: Registra parâmetros coletados no dia 3 do teste primário..." rows={2} />
          </Form.Item>

          <Divider />

          {/* Configurações de Replicas */}
          <Title level={5} style={{ fontFamily: 'Barlow, sans-serif', margin: '0 0 12px 0' }}>2. Configurações de Réplicas (OCDE)</Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="experiments_per_lab" label="Número de Experimentos por Lab" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="replicates_per_experiment" label="Número de Réplicas por Experimento" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          {/* COLUMN BUILDER SECTION */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <Title level={5} style={{ fontFamily: 'Barlow, sans-serif', margin: 0 }}>3. Estrutura de Colunas (Esquema)</Title>
            {canExecute && (
              <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={() => handleOpenColModal()}>
                Adicionar Coluna
              </Button>
            )}
          </div>

          <Table
            dataSource={columnsList}
            pagination={false}
            size="small"
            bordered
            rowKey="id"
            columns={[
              {
                title: 'Ordem',
                dataIndex: 'position',
                key: 'position',
                width: 70,
                render: (pos) => <Text strong>{pos >= 1000 ? '-' : pos}</Text>
              },
              {
                title: 'Identificador',
                dataIndex: 'name',
                key: 'name',
                render: (name) => <code>{name}</code>
              },
              {
                title: 'Rótulo exibido',
                dataIndex: 'label',
                key: 'label'
              },
              {
                title: 'Tipo',
                dataIndex: 'type',
                key: 'type',
                render: (type) => <Tag style={{ borderRadius: '4px' }}>{type.toUpperCase()}</Tag>
              },
              {
                title: 'Configurações',
                key: 'config',
                render: (_, record) => {
                  if (record.is_system) {
                    return <Tag color="orange" icon={<LockOutlined />} style={{ borderRadius: '4px', fontSize: '10px' }}>SISTEMA</Tag>
                  }
                  return (
                    <Space wrap size={[4, 4]}>
                      {record.required && <Tag color="red" style={{ borderRadius: '4px', fontSize: '10px' }}>OBRIGATÓRIO</Tag>}
                      {record.is_derived_data ? (
                        <Tooltip title={`Derivado de: ${record.source_columns?.join(', ')}`}>
                          <Tag color="purple" icon={<SlidersOutlined />} style={{ borderRadius: '4px', fontSize: '10px', cursor: 'help' }}>DERIVADO</Tag>
                        </Tooltip>
                      ) : (
                        <Tag color="cyan" style={{ borderRadius: '4px', fontSize: '10px' }}>BRUTO</Tag>
                      )}
                    </Space>
                  )
                }
              },
              {
                title: 'Ações',
                key: 'actions',
                width: 90,
                render: (_, record) => {
                  if (record.is_system) return null
                  return (
                    <Space>
                      <Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleOpenColModal(record)} disabled={!canExecute} />
                      <Popconfirm
                        title="Remover coluna do template?"
                        onConfirm={() => handleDeleteColumn(record.id)}
                        okText="Sim"
                        cancelText="Não"
                        disabled={!canExecute}
                      >
                        <Button type="text" size="small" danger icon={<DeleteOutlined />} disabled={!canExecute} />
                      </Popconfirm>
                    </Space>
                  )
                }
              }
            ]}
          />
        </Form>
      </Drawer>

      {/* MODAL COLUMN EDITOR (ColumnBuilder) */}
      <Modal
        title={selectedCol ? 'Editar Configuração de Coluna' : 'Adicionar Coluna de Dados'}
        open={isColModalOpen}
        onCancel={() => setIsColModalOpen(false)}
        onOk={handleSaveColumn}
        width={600}
        okText="Confirmar"
        cancelText="Cancelar"
      >
        <Form form={colForm} layout="vertical" style={{ paddingTop: '12px' }}>
          <Row gutter={16}>
            <Col span={14}>
              <Form.Item
                name="label"
                label="Rótulo de Exibição"
                rules={[{ required: true, message: 'Digite o rótulo da coluna (ex: Medição Final).' }]}
              >
                <Input placeholder="Ex: Medição Final (pH)" onChange={(e) => {
                  // Auto-generate name identifier from label
                  if (!selectedCol) {
                    const val = e.target.value
                      .toLowerCase()
                      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
                      .replace(/[^a-z0-9_]/g, '_') // Replace symbols with underscore
                      .replace(/__+/g, '_') // Deduplicate underscores
                      .replace(/^_+|_+$/g, '') // Trim underscores
                    colForm.setFieldsValue({ name: val })
                  }
                }} />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item
                name="name"
                label="Identificador do Campo (Apenas letras/números)"
                rules={[
                  { required: true, message: 'Digite o identificador.' },
                  { pattern: /^[a-z0-9_]+$/, message: 'Apenas minúsculas, números e sublinhados.' }
                ]}
              >
                <Input placeholder="Ex: medicao_final_ph" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="type" label="Tipo de Dado" rules={[{ required: true }]}>
                <Select placeholder="Selecione o tipo">
                  <Select.Option value="text">Texto Simples</Select.Option>
                  <Select.Option value="long_text">Texto Longo</Select.Option>
                  <Select.Option value="integer">Inteiro</Select.Option>
                  <Select.Option value="decimal">Decimal (Ponto Flutuante)</Select.Option>
                  <Select.Option value="boolean">Booleano (Lógico)</Select.Option>
                  <Select.Option value="date">Data</Select.Option>
                  <Select.Option value="datetime">Data e Hora</Select.Option>
                  <Select.Option value="select">Seleção Única (Dropdown)</Select.Option>
                  <Select.Option value="multiselect">Seleção Múltipla</Select.Option>
                  <Select.Option value="file">Arquivo Anexo</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="required" label="Obrigatório?" valuePropName="checked">
                <Switch checkedChildren="Sim" unCheckedChildren="Não" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="position" label="Posição / Ordem" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          {/* Configuration of SELECT OPTIONS if type is dropdown/multiselect */}
          <Form.Item shouldUpdate={(prev, curr) => prev.type !== curr.type} noStyle>
            {({ getFieldValue }) => {
              const type = getFieldValue('type')
              if (type !== 'select' && type !== 'multiselect') return null
              return (
                <Form.Item
                  name="options"
                  label="Opções de Seleção (Pressione Enter para adicionar opções)"
                  rules={[{ required: true, message: 'Insira pelo menos uma opção para a lista.' }]}
                >
                  <Select mode="tags" placeholder="Ex: Negativo, Moderado, Severo" style={{ width: '100%' }} />
                </Form.Item>
              )
            }}
          </Form.Item>

          <Divider />

          {/* Raw vs Derived data configurations */}
          <Form.Item name="dataType" label="Natureza do Dado" rules={[{ required: true }]}>
            <Radio.Group style={{ width: '100%' }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Card size="small" hoverable>
                    <Radio value="raw">
                      <Text strong>Dados Brutos</Text><br />
                      <Text type="secondary" style={{ fontSize: '11px' }}>Dado bruto obtido diretamente do ensaio físico.</Text>
                    </Radio>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" hoverable>
                    <Radio value="derived">
                      <Text strong>Dados Derivados</Text><br />
                      <Text type="secondary" style={{ fontSize: '11px' }}>Calculado ou transformado a partir de outros campos.</Text>
                    </Radio>
                  </Card>
                </Col>
              </Row>
            </Radio.Group>
          </Form.Item>

          <Form.Item shouldUpdate={(prev, curr) => prev.dataType !== curr.dataType} noStyle>
            {({ getFieldValue }) => {
              const dataType = getFieldValue('dataType')
              if (dataType !== 'derived') return null
              
              // Filter available columns that can be source pointers (excluding the one being edited if editing)
              const availableSources = columnsList.filter(c => c.name !== getFieldValue('name'))
              
              return (
                <Form.Item
                  name="source_columns"
                  label="Colunas de Origem (Indique a rastreabilidade)"
                  rules={[{ required: true, message: 'Selecione pelo menos uma coluna que dá origem a este dado.' }]}
                >
                  <Select
                    mode="multiple"
                    placeholder="Selecione as colunas de origem"
                    style={{ width: '100%' }}
                    options={availableSources.map(c => ({ value: c.name, label: `${c.label} (${c.name})` }))}
                  />
                </Form.Item>
              )
            }}
          </Form.Item>
        </Form>
      </Modal>

      {/* TEMPLATE PREVIEW MODAL */}
      <Modal
        title={`Prévia Tabular: ${previewTemplate?.name}`}
        open={isPreviewModalOpen}
        onCancel={() => setIsPreviewModalOpen(false)}
        width={900}
        footer={[
          <Button key="ok" type="primary" onClick={() => setIsPreviewModalOpen(false)}>Fechar</Button>
        ]}
      >
        <div style={{ padding: '16px 0', overflowX: 'auto' }}>
          <Table
            dataSource={[{ id: 'place-holder-row' }]}
            pagination={false}
            bordered
            size="middle"
            columns={previewColumns.map(c => ({
              title: (
                <Flex vertical>
                  <Text strong>{c.label}</Text>
                  <Text type="secondary" style={{ fontSize: '11px', fontFamily: 'monospace' }}>{c.name}</Text>
                </Flex>
              ),
              key: c.name,
              render: () => {
                if (c.is_system) {
                  return <Text type="secondary" italic style={{ fontSize: '12px' }}>[metadado autocompletado]</Text>
                }
                if (c.is_derived_data) {
                  return <Text style={{ color: '#722ed1', italic: true, fontSize: '12px' }}>[fórmula derivada]</Text>
                }
                return <Text type="secondary" italic style={{ fontSize: '11px' }}>({c.type})</Text>
              }
            }))}
          />
        </div>
        <div style={{ marginTop: '12px', color: '#8c8c8c', fontSize: '12px' }}>
          <InfoCircleOutlined style={{ marginRight: '4px' }} />
          Esta é uma prévia do leiaute que os laboratórios receberão para inserção de dados. O cabeçalho inclui metadados obrigatórios de rastreabilidade (OECD).
        </div>
      </Modal>
    </Space>
  )
}
