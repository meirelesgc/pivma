import { useState } from 'react'
import { Button, Form, Space, Typography, Progress } from 'antd'
import { UploadOutlined, FileOutlined, DeleteOutlined } from '@ant-design/icons'

const { Text } = Typography

export function UploadInput({ field, value, onChange, disabled }) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    setProgress(10)
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setUploading(false)
          onChange(file.name)
          return 100
        }
        return prev + 30
      })
    }, 200)
  }

  const handleRemove = () => {
    onChange('')
    setProgress(0)
  }

  return (
    <Form.Item
      label={field.name}
      required
      style={{ marginBottom: '16px', fontFamily: 'Lexend, sans-serif' }}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        {value ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            border: '1px solid #d9d9d9'
          }}>
            <Space style={{ overflow: 'hidden' }}>
              <FileOutlined style={{ color: '#1890ff', fontSize: '18px', flexShrink: 0 }} />
              <Text strong ellipsis style={{ maxWidth: '300px' }}>{value}</Text>
            </Space>
            {!disabled && (
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={handleRemove}
              />
            )}
          </div>
        ) : (
          <div>
            <input
              type="file"
              id={`file-upload-${field.id}`}
              style={{ display: 'none' }}
              onChange={handleFileChange}
              disabled={disabled || uploading}
              accept=".pdf,.doc,.docx,.xlsx"
            />
            <Button
              icon={<UploadOutlined />}
              disabled={disabled || uploading}
              loading={uploading}
              style={{ borderRadius: '8px' }}
              onClick={() => document.getElementById(`file-upload-${field.id}`).click()}
            >
              {uploading ? 'Enviando...' : 'Selecionar Documento (PDF, DOCX)'}
            </Button>
          </div>
        )}
        {uploading && <Progress percent={progress} size="small" showInfo={false} />}
      </Space>
    </Form.Item>
  )
}
