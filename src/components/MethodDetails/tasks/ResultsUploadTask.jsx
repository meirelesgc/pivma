import { useState, useEffect } from 'react'
import { Card, Typography, Button, Upload, Alert, Table, Tag, Space, Flex, message } from 'antd'
import { DownloadOutlined, UploadOutlined, CheckCircleOutlined, InfoCircleOutlined, LockOutlined, FileExcelOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { useAuth } from '../../../hooks/useAuth'
import { useProcesses, useFormTask, useDataTemplates, useDataTemplateColumns } from '../../../hooks/useProcesses'

const { Title, Text, Paragraph } = Typography

export function ResultsUploadTask({ task, onToggle }) {
  const { user: currentUser } = useAuth()
  const { processInstanceRoles = [] } = useProcesses()
  
  const { templates = [], isLoadingTemplates } = useDataTemplates(task.process_instance_id)
  const activeTemplate = templates[0] // Get first template for this instance
  
  const { columns = [], isLoadingColumns } = useDataTemplateColumns(activeTemplate?.id)

  const { answers = {}, saveAnswers } = useFormTask(null, task.id)

  const [fileName, setFileName] = useState('')
  const [csvContent, setCsvContent] = useState('')
  const [validationErrors, setValidationErrors] = useState([])
  const [parsedData, setParsedData] = useState([])
  const [isValidated, setIsValidated] = useState(false)
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)

  useEffect(() => {
    if (answers && answers.uploaded_file_name) {
      setFileName(answers.uploaded_file_name)
      if (answers.parsed_rows) {
        setParsedData(answers.parsed_rows)
        setIsValidated(true)
      }
    }
  }, [answers])

  // Determine user permissions
  const userRoleObj = processInstanceRoles.find(
    r => r.instance_id === task.process_instance_id && r.user_id === currentUser?.id
  )
  const isLabParticipant = userRoleObj ? userRoleObj.role.toLowerCase() === 'laboratórios participantes' : false
  const isAdmin = currentUser?.system_role === 'admin'
  const canExecute = (isLabParticipant || isAdmin) && !task.is_completed

  // CSV Generator for Template download
  const handleDownloadTemplate = () => {
    if (columns.length === 0) return

    // Generate CSV Headers using labels
    const headers = columns.map(col => `"${col.label}"`).join(',')
    
    // Generate a mock row of data representing placeholders/formats
    const mockRow = columns.map(col => {
      if (col.name === 'sample_code') return '"XR-3921-K"'
      if (col.type === 'integer' || col.type === 'int') return '8'
      if (col.type === 'number' || col.type === 'float') return '99.5'
      if (col.type === 'date') return '"2026-06-20"'
      if (col.type === 'datetime') return '"2026-06-20 08:30:00"'
      if (col.type === 'select') return col.options && col.options.length > 0 ? `"${col.options[0]}"` : '"completed"'
      return '"Exemplo"'
    }).join(',')

    const csvContent = '\uFEFF' + headers + '\n' + mockRow // UTF-8 BOM
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `template_${activeTemplate.name.toLowerCase().replace(/\s+/g, '_')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Client-side CSV Parser & Validator
  const validateCSV = (text, name) => {
    const errors = []
    const rows = []
    
    // Split lines by newline and filter out empty lines
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0)
    
    if (lines.length < 2) {
      errors.push('O arquivo está vazio ou contém apenas a linha de cabeçalho.')
      setValidationErrors(errors)
      setIsValidated(false)
      return
    }

    // Parse CSV headers (handling quotes)
    const parseCSVLine = (line) => {
      const result = []
      let current = ''
      let inQuotes = false
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      result.push(current.trim())
      return result
    }

    const headers = parseCSVLine(lines[0])

    // Match CSV columns with template schema columns
    const colIndices = {}
    columns.forEach(col => {
      // Find matching index in headers by label or name
      const idx = headers.findIndex(h => 
        h.toLowerCase() === col.label.toLowerCase() || 
        h.toLowerCase() === col.name.toLowerCase()
      )
      if (idx !== -1) {
        colIndices[col.name] = idx
      } else if (col.required) {
        errors.push(`Coluna obrigatória ausente no cabeçalho: "${col.label}"`)
      }
    })

    if (errors.length > 0) {
      setValidationErrors(errors)
      setIsValidated(false)
      return
    }

    // Validate data rows
    for (let i = 1; i < lines.length; i++) {
      const rowNum = i + 1
      const values = parseCSVLine(lines[i])
      const rowData = { key: i }

      columns.forEach(col => {
        const idx = colIndices[col.name]
        const val = idx !== undefined ? values[idx] : undefined
        
        // 1. Check if required field is empty
        if (col.required && (val === undefined || val === null || val === '')) {
          errors.push(`Linha ${rowNum}: O campo "${col.label}" é obrigatório e está vazio.`)
          return
        }

        if (val !== undefined && val !== null && val !== '') {
          // 2. Validate Integers
          if (col.type === 'integer' || col.type === 'int') {
            const intVal = parseInt(val, 10)
            if (isNaN(intVal) || String(intVal) !== val) {
              errors.push(`Linha ${rowNum}: O campo "${col.label}" deve ser um número inteiro (digitado: "${val}").`)
            }
            rowData[col.name] = intVal
          }
          // 3. Validate Floats/Numbers
          else if (col.type === 'number' || col.type === 'float') {
            const floatVal = parseFloat(val)
            if (isNaN(floatVal)) {
              errors.push(`Linha ${rowNum}: O campo "${col.label}" deve ser um número decimal válido (digitado: "${val}").`)
            }
            rowData[col.name] = floatVal
          }
          // 4. Validate Select lists
          else if (col.type === 'select' && col.options) {
            if (!col.options.includes(val)) {
              errors.push(`Linha ${rowNum}: O campo "${col.label}" possui um valor inválido ("${val}"). Opções válidas: ${col.options.join(', ')}`)
            }
            rowData[col.name] = val
          }
          // 5. Default Texts
          else {
            rowData[col.name] = val
          }
        } else {
          rowData[col.name] = null
        }
      })

      rows.push(rowData)
    }

    if (errors.length === 0) {
      setParsedData(rows)
      setValidationErrors([])
      setIsValidated(true)
      setFileName(name)
      setCsvContent(text)
      
      // Auto-save parsed data to mock DB
      saveAnswers({
        instanceTaskId: task.id,
        answers: {
          ...answers,
          uploaded_file_name: name,
          parsed_rows: rows
        }
      })
    } else {
      setValidationErrors(errors)
      setIsValidated(false)
    }
  }

  const handleUploadFile = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      validateCSV(e.target.result, file.name)
    }
    reader.readAsText(file)
    return false // Prevent automatic upload submit action
  }

  const handleSubmit = () => {
    setAttemptedSubmit(true)
    if (!isValidated) {
      message.error('Por favor, carregue e valide uma planilha correta antes de submeter.')
      return
    }

    saveAnswers({
      instanceTaskId: task.id,
      answers: {
        ...answers,
        uploaded_file_name: fileName,
        parsed_rows: parsedData,
        submitted: true
      }
    }, {
      onSuccess: () => {
        onToggle() // complete task
        message.success('Resultados estatísticos submetidos com sucesso!')
      },
      onError: () => {
        message.error('Erro ao submeter os resultados.')
      }
    })
  }

  // Columns for data preview table
  const tableColumns = columns.map(col => ({
    title: col.label,
    dataIndex: col.name,
    key: col.name,
    render: (val) => {
      if (val === null || val === undefined) return <Text type="secondary">-</Text>
      if (typeof val === 'number') return <Text strong style={{ color: '#025ECC' }}>{val}</Text>
      return <span>{String(val)}</span>
    }
  }))

  if (isLoadingTemplates || isLoadingColumns) {
    return <Text type="secondary">Carregando template de coleta de dados...</Text>
  }

  if (!activeTemplate) {
    return <Alert message="Nenhum template de coleta definido pelo estatístico na etapa de planejamento." type="warning" showIcon />
  }

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      
      {/* CARD 1: Instructions & Download */}
      <Card
        style={{
          borderRadius: '20px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)',
          border: '1px solid #eef0f2',
          background: '#ffffff'
        }}
        bodyStyle={{ padding: '24px' }}
      >
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          {!canExecute && !task.is_completed && (
            <Alert
              message="Acesso Restrito"
              description="A submissão de planilhas de resultados é restrita aos representantes dos Laboratórios Participantes."
              type="warning"
              showIcon
              icon={<LockOutlined />}
              style={{ borderRadius: '12px' }}
            />
          )}

          {task.is_completed && (
            <Alert
              message="Tarefa Concluída"
              description="Os resultados deste laboratório foram enviados com sucesso e encontram-se em fase de análise."
              type="success"
              showIcon
              icon={<CheckCircleOutlined />}
              style={{ borderRadius: '12px' }}
            />
          )}

          <div>
            <Title level={4} style={{ fontFamily: 'Barlow, sans-serif', color: '#014E2A', margin: '0 0 8px 0' }}>
              Download do Modelo de Resultados ({activeTemplate.name})
            </Title>
            <Paragraph style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 16px 0' }}>
              {activeTemplate.description || 'Preencha a planilha modelo com os dados dos experimentos e réplicas e submeta o arquivo final em formato CSV.'}
            </Paragraph>

            <div style={{ background: '#FAFAFA', padding: '16px', borderRadius: '12px', border: '1px solid #EFEFEF', marginBottom: '16px' }}>
              <Space direction="vertical" size={6} style={{ fontSize: '13px' }}>
                <div>
                  <Text type="secondary">Experimentos independentes por lab: </Text>
                  <Text strong>{activeTemplate.replicate_configuration?.experiments_per_lab || 'N/A'}</Text>
                </div>
                <div>
                  <Text type="secondary">Réplicas por experimento: </Text>
                  <Text strong>{activeTemplate.replicate_configuration?.replicates_per_experiment || 'N/A'}</Text>
                </div>
                <div>
                  <Text type="secondary">Permite corridas inválidas/com falha: </Text>
                  <Tag color={activeTemplate.allow_failed_runs ? 'green' : 'red'}>
                    {activeTemplate.allow_failed_runs ? 'SIM' : 'NÃO'}
                  </Tag>
                </div>
              </Space>
            </div>

            <Button
              type="dashed"
              icon={<DownloadOutlined />}
              onClick={handleDownloadTemplate}
              style={{
                borderRadius: '12px',
                height: '40px',
                fontWeight: '600',
                color: '#014E2A',
                borderColor: '#014E2A'
              }}
            >
              Baixar Planilha Modelo (.csv)
            </Button>
          </div>
        </Space>
      </Card>

      {/* CARD 2: Upload Area */}
      <Card
        style={{
          borderRadius: '20px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)',
          border: '1px solid #eef0f2',
          background: '#ffffff'
        }}
        bodyStyle={{ padding: '24px' }}
      >
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <div>
            <Title level={4} style={{ fontFamily: 'Barlow, sans-serif', color: '#014E2A', margin: '0 0 8px 0' }}>
              Upload de Arquivo de Resultados
            </Title>
            <Paragraph style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>
              Faça o upload do arquivo contendo os dados obtidos. O arquivo será analisado automaticamente contra as definições das colunas.
            </Paragraph>
          </div>

          <Upload.Dragger
            name="file"
            multiple={false}
            accept=".csv"
            beforeUpload={handleUploadFile}
            showUploadList={false}
            disabled={!canExecute}
            style={{
              borderRadius: '16px',
              border: '2px dashed #D9D9D9',
              padding: '24px 0',
              backgroundColor: '#FAFAFA'
            }}
          >
            <p className="ant-upload-drag-icon">
              <FileExcelOutlined style={{ fontSize: '48px', color: '#52c41a' }} />
            </p>
            <p className="ant-upload-text" style={{ fontFamily: 'Lexend, sans-serif', fontWeight: 'bold' }}>
              Clique ou arraste o arquivo CSV para esta área
            </p>
            <p className="ant-upload-hint" style={{ fontSize: '12px', color: '#8c8c8c' }}>
              Apenas arquivos .csv são aceitos. A validação estrutural será executada imediatamente.
            </p>
          </Upload.Dragger>

          {fileName && (
            <Alert
              message={`Arquivo carregado: ${fileName}`}
              type={isValidated ? "success" : "error"}
              showIcon
              style={{ borderRadius: '12px' }}
            />
          )}

          {validationErrors.length > 0 && (
            <Alert
              message="Falha na Validação da Planilha"
              description={
                <ul style={{ paddingLeft: '16px', margin: '8px 0 0 0', fontSize: '13px' }}>
                  {validationErrors.map((err, idx) => (
                    <li key={idx} style={{ color: '#db3016', listStyleType: 'disc' }}>{err}</li>
                  ))}
                </ul>
              }
              type="error"
              showIcon
              icon={<CloseCircleOutlined />}
              style={{ borderRadius: '12px' }}
            />
          )}

          {isValidated && validationErrors.length === 0 && (
            <Alert
              message="Validação Concluída com Sucesso!"
              description="Todas as colunas, tipos e preenchimentos obrigatórios estão em conformidade com o schema do template de dados."
              type="success"
              showIcon
              style={{ borderRadius: '12px' }}
            />
          )}
        </Space>
      </Card>

      {/* CARD 3: Preview Data (only if parsed/validated) */}
      {isValidated && parsedData.length > 0 && (
        <Card
          style={{
            borderRadius: '20px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)',
            border: '1px solid #eef0f2',
            background: '#ffffff'
          }}
          bodyStyle={{ padding: '24px' }}
        >
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <div>
              <Title level={4} style={{ fontFamily: 'Barlow, sans-serif', color: '#014E2A', margin: '0 0 8px 0' }}>
                Prévia dos Dados Validados
              </Title>
              <Paragraph style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>
                Visualização das primeiras linhas parseadas do arquivo carregado.
              </Paragraph>
            </div>

            <Table
              dataSource={parsedData}
              columns={tableColumns}
              pagination={{ pageSize: 5 }}
              size="small"
              bordered
              style={{ borderRadius: '12px', overflow: 'hidden' }}
            />

            {canExecute && (
              <Flex justify="end" style={{ marginTop: '12px' }}>
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
                  Submeter Planilha de Resultados
                </Button>
              </Flex>
            )}
          </Space>
        </Card>
      )}
    </Space>
  )
}
