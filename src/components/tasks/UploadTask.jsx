import { useState } from 'react'
import { useCompleteTask, useUploadDocument } from '../../hooks/useTasks'
import { useAuth } from '../../hooks/useAuth'
import {
  Typography,
  Button,
  Upload,
  message,
  Space
} from 'antd'
import { InboxOutlined } from '@ant-design/icons'

const { Title, Paragraph } = Typography
const { Dragger } = Upload

export function UploadTask({ task, taskInstance, processId, canEdit = true }) {
  const { user } = useAuth()
  const [fileList, setFileList] = useState([])

  const completeTaskMutation = useCompleteTask()
  const uploadDocumentMutation = useUploadDocument()

  const handleComplete = async () => {
    if (fileList.length === 0) {
      message.warning('Por favor, faça o upload de pelo menos um documento.')
      return
    }

    try {
      await completeTaskMutation.mutateAsync({
        taskInstanceId: taskInstance.id,
        userId: user.id
      })
      message.success('Documentos enviados e tarefa concluída!')
      // Invalidação centralizada via useCompleteTask
    } catch (error) {
      message.error('Erro ao concluir tarefa: ' + error.message)
    }
  }

  const uploadProps = {
    name: 'file',
    multiple: true,
    fileList,
    disabled: !canEdit,
    onChange(info) {
      setFileList(info.fileList)
    },
    customRequest: async ({ file, onSuccess, onError }) => {
      try {
        await uploadDocumentMutation.mutateAsync({
          process_instance_id: processId,
          task_instance_id: taskInstance.id,
          user_id: user.id,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type
        })
        onSuccess("ok")
      } catch (err) {
        onError(err)
      }
    }
  }

  return (
    <div className="upload-task">
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>{task.name}</Title>
          <Paragraph type="secondary">
            Faça o upload dos documentos necessários para comprovação dos dados informados.
          </Paragraph>
        </div>

        <Dragger {...uploadProps} style={{ padding: '40px', background: 'var(--bg-light)', border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-l)' }}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined style={{ color: 'var(--primary-color)' }} />
          </p>
          <p className="ant-upload-text">Clique ou arraste arquivos para esta área para fazer o upload</p>
          <p className="ant-upload-hint">Suporte para submissão individual ou em lote. Formatos aceitos: PDF, DOCX, PNG, JPG.</p>
        </Dragger>

        <div style={{ marginTop: 24 }}>
          <Button
            type="primary"
            size="large"
            onClick={handleComplete}
            loading={completeTaskMutation.isPending}
            disabled={!canEdit || fileList.length === 0}
            style={{ borderRadius: 'var(--radius-m)', height: '48px', padding: '0 32px' }}
          >
            Concluir Envio de Documentos
          </Button>
        </div>
      </Space>
    </div>
  )
}
