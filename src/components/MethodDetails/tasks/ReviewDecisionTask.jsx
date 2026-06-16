import { useState } from 'react'
import { Typography, Table, Tag, Button, Space, Upload, message, Alert, Row, Col, Card } from 'antd'
import { InboxOutlined, DownloadOutlined, FilePdfOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { useSampleDefinitions, useDataTemplates } from '../../../hooks/useProcesses'

const { Title, Paragraph, Text } = Typography
const { Dragger } = Upload

export function ReviewDecisionTask({ task, onToggle }) {
  const instanceId = task.process_instance_id
  const { samples = [], isLoadingSamples } = useSampleDefinitions(instanceId)
  const { templates = [], isLoadingTemplates } = useDataTemplates(instanceId)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 1. Simulação dos resultados enviados pelos laboratórios
  const simulatedResults = [
    { key: '1', lab: 'Laboratório Alfa (Líder)', sampleCode: 'CE-9021-A', replicate: '1', value: '94.2%', status: 'Valido' },
    { key: '2', lab: 'Laboratório Alfa (Líder)', sampleCode: 'CE-9021-A', replicate: '2', value: '93.8%', status: 'Valido' },
    { key: '3', lab: 'Laboratório Beta', sampleCode: 'CE-9021-B', replicate: '1', value: '92.1%', status: 'Valido' },
    { key: '4', lab: 'Laboratório Beta', sampleCode: 'CE-9021-B', replicate: '2', value: '93.5%', status: 'Valido' },
    { key: '5', lab: 'Laboratório Gama', sampleCode: 'CE-9021-C', replicate: '1', value: '95.0%', status: 'Valido' },
    { key: '6', lab: 'Laboratório Gama', sampleCode: 'CE-9021-C', replicate: '2', value: '94.8%', status: 'Valido' },
  ]

  // Columns for the simulated results table
  const resultsColumns = [
    { title: 'Laboratório', dataIndex: 'lab', key: 'lab' },
    { title: 'Código Cego Amostra', dataIndex: 'sampleCode', key: 'sampleCode', render: (code) => <Tag color="geekblue">{code}</Tag> },
    { title: 'Réplica', dataIndex: 'replicate', key: 'replicate' },
    { title: 'Viabilidade Celular (%)', dataIndex: 'value', key: 'value', render: (val) => <strong>{val}</strong> },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <Tag color="success">{s.toUpperCase()}</Tag> }
  ]

  // 2. Função de Download do CSV consolidado
  const handleDownloadCSV = () => {
    // Generate mock CSV content based on registered samples, templates, and simulated results
    let csvContent = 'data:text/csv;charset=utf-8,'
    csvContent += 'ID da Instancia,Metodo,Estudo\n'
    csvContent += `BRA-2026-${String(instanceId).padStart(3, '0')},PI-VMA Validaçao Alternativa,Estudo In-Vitro\n\n`
    
    csvContent += '--- AMOSTRAS CADASTRADAS ---\n'
    csvContent += 'Nome Quimico,CASRN,Quantidade,SDS File\n'
    samples.forEach(s => {
      csvContent += `"${s.chemical_name}","${s.casrn}",${s.quantity} ${s.unit || 'g'},"${s.sds_file || 'N/A'}"\n`
    })

    csvContent += '\n--- TEMPLATES DE COLETA ---\n'
    csvContent += 'Nome do Template,Descriçao,Replicas por Experimento\n'
    templates.forEach(t => {
      csvContent += `"${t.name}","${t.description}",${t.replicate_configuration?.replicates_per_experiment || 1}\n`
    })

    csvContent += '\n--- RESULTADOS SUBMETIDOS PELOS LABORATORIOS ---\n'
    csvContent += 'Laboratorio,Codigo Cego Amostra,Replica,Viabilidade Celular,Status\n'
    simulatedResults.forEach(r => {
      csvContent += `"${r.lab}","${r.sampleCode}",${r.replicate},"${r.value}","${r.status}"\n`
    })

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `BRA-2026-${String(instanceId).padStart(3, '0')}_relatorio_consolidado.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    message.success('Relatório consolidado baixado com sucesso!')
  }

  // 3. Mock Uploader configurations
  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: '.pdf',
    beforeUpload(file) {
      const isPdf = file.type === 'application/pdf'
      if (!isPdf) {
        message.error('Você só pode enviar arquivos PDF!')
        return Upload.LIST_IGNORE
      }
      setUploadedFile(file)
      message.success(`${file.name} foi carregado localmente com sucesso!`)
      return false // Stop actual upload request
    },
    onRemove() {
      setUploadedFile(null)
    }
  }

  const handleSubmitParecer = () => {
    if (!uploadedFile) {
      message.warning('Por favor, faça o upload do PDF do seu parecer antes de concluir.')
      return
    }
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      message.success('Parecer homologado e validação concluída com sucesso!')
      onToggle() // complete task
    }, 1500)
  }

  const isCompleted = task.is_completed

  return (
    <Space direction="vertical" size="large" style={{ width: '100%', fontFamily: 'Lexend, sans-serif' }}>
      
      {/* Resumo dos Dados Cadastrados */}
      <Card title="1. Resumo dos Ativos Cadastrados" size="small" style={{ borderRadius: '12px', border: '1px solid #f0f0f0' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Title level={5} style={{ fontFamily: 'Barlow, sans-serif' }}>Substâncias & Amostras ({samples.length})</Title>
            {isLoadingSamples ? <Text>Carregando amostras...</Text> : samples.length === 0 ? <Text type="secondary">Nenhuma amostra cadastrada.</Text> : (
              <ul style={{ paddingLeft: '20px', margin: 0 }}>
                {samples.map(s => (
                  <li key={s.id}>
                    <Text strong>{s.chemical_name}</Text> (CAS: {s.casrn}) - {s.quantity} {s.unit || 'g'}
                  </li>
                ))}
              </ul>
            )}
          </Col>
          <Col xs={24} md={12}>
            <Title level={5} style={{ fontFamily: 'Barlow, sans-serif' }}>Templates de Coleta Estabelecidos ({templates.length})</Title>
            {isLoadingTemplates ? <Text>Carregando templates...</Text> : templates.length === 0 ? <Text type="secondary">Nenhum template cadastrado.</Text> : (
              <ul style={{ paddingLeft: '20px', margin: 0 }}>
                {templates.map(t => (
                  <li key={t.id}>
                    <Text strong>{t.name}</Text>: {t.description || 'Sem descrição'}
                  </li>
                ))}
              </ul>
            )}
          </Col>
        </Row>
      </Card>

      {/* Resultados de Laboratórios */}
      <Card title="2. Resultados Experimentais Submetidos (Simulados)" size="small" style={{ borderRadius: '12px', border: '1px solid #f0f0f0' }}>
        <Paragraph>
          Os laboratórios participantes submeteram as planilhas de resultados preenchidas com base no template estatístico definido. Os dados foram consolidados abaixo:
        </Paragraph>
        <Table 
          dataSource={simulatedResults} 
          columns={resultsColumns} 
          pagination={false} 
          size="small" 
          bordered 
          style={{ marginBottom: '16px' }}
        />
        <Button 
          type="primary" 
          icon={<DownloadOutlined />} 
          onClick={handleDownloadCSV}
          style={{ borderRadius: '6px' }}
        >
          Baixar Planilha de Resultados Consolidados (CSV)
        </Button>
      </Card>

      {/* Emissão de Parecer */}
      <Card title="3. Parecer e Decisão de Homologação" size="small" style={{ borderRadius: '12px', border: '1px solid #f0f0f0' }}>
        {isCompleted ? (
          <Alert
            message="Validação Concluída"
            description="O parecer técnico já foi enviado e a validação do método alternativo foi homologada com sucesso."
            type="success"
            showIcon
            icon={<CheckCircleOutlined />}
          />
        ) : (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Paragraph>
              Após analisar os dados consolidados e os resultados experimentais enviados pelos laboratórios, anexe o <strong>Parecer Final de Homologação (formato PDF)</strong> para concluir a validação do estudo.
            </Paragraph>
            
            <Dragger {...uploadProps} style={{ padding: '20px', background: '#fafafa', borderRadius: '10px' }}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined style={{ color: 'var(--color-02)' }} />
              </p>
              <p className="ant-upload-text">Clique ou arraste o arquivo PDF do parecer para esta área</p>
              <p className="ant-upload-hint">Apenas arquivos PDF são aceitos para homologação formal.</p>
            </Dragger>

            {uploadedFile && (
              <Alert
                message={
                  <Space>
                    <FilePdfOutlined style={{ color: '#ff4d4f', fontSize: '16px' }} />
                    <Text strong>{uploadedFile.name}</Text>
                    <Text type="secondary">({(uploadedFile.size / 1024).toFixed(1)} KB)</Text>
                  </Space>
                }
                type="info"
                showIcon={false}
              />
            )}

            <Button
              type="primary"
              onClick={handleSubmitParecer}
              loading={isSubmitting}
              disabled={!uploadedFile}
              style={{
                height: '42px',
                borderRadius: '8px',
                fontWeight: '600',
                marginTop: '8px',
                backgroundColor: 'var(--color-06)',
                borderColor: 'var(--color-06)'
              }}
              block
            >
              Homologar Parecer e Concluir Validação
            </Button>
          </Space>
        )}
      </Card>
    </Space>
  )
}
