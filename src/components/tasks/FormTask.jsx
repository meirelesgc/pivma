import { useFormDetails, useSubmitFormResponse } from '../../hooks/useForms'
import { useCompleteTask } from '../../hooks/useTasks'
import { useAuth } from '../../hooks/useAuth'
import {
  Form,
  Input,
  Button,
  Typography,
  Skeleton,
  message,
  Space
} from 'antd'

const { Title, Paragraph } = Typography
const { TextArea } = Input

export function FormTask({ task, taskInstance, processId, canEdit = true }) {
  const [form] = Form.useForm()
  const { user } = useAuth()

  const { data: formDetails, isLoading } = useFormDetails(task.form_id)
  const submitFormMutation = useSubmitFormResponse()
  const completeTaskMutation = useCompleteTask()

  const isPending = submitFormMutation.isPending || completeTaskMutation.isPending

  if (isLoading) return <Skeleton active />

  if (!formDetails) return <div>Formulário não encontrado</div>

  const onFinish = async (values) => {
    try {
      // 1. Salvar resposta do formulário
      await submitFormMutation.mutateAsync({
        process_instance_id: processId,
        form_id: task.form_id,
        responses: values,
        user_id: user.id
      })

      // 2. Marcar tarefa como concluída
      await completeTaskMutation.mutateAsync({ 
        taskInstanceId: taskInstance.id, 
        userId: user.id 
      })

      message.success('Formulário enviado com sucesso!')
      
      // NOTA: A invalidação agora é feita dentro do hook useCompleteTask, 
      // cobrindo 'process', 'processes' e 'taskInstance'.
    } catch (error) {
      message.error('Erro ao processar formulário: ' + error.message)
    }
  }

  return (
    <div className="form-task">
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>{formDetails.name}</Title>
          {formDetails.description && (
            <Paragraph type="secondary" style={{ marginBottom: 24 }}>
              {formDetails.description}
            </Paragraph>
          )}
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          requiredMark="optional"
          disabled={!canEdit}
        >
          {formDetails.fields?.map(field => (
            <Form.Item
              key={field.id}
              label={field.label}
              name={field.field_name}
              rules={[{ required: field.required, message: `Por favor, preencha o campo ${field.label}` }]}
            >
              {field.field_type === 'textarea' ? (
                <TextArea placeholder={field.placeholder} rows={4} />
              ) : (
                <Input placeholder={field.placeholder} />
              )}
            </Form.Item>
          ))}

          <Form.Item style={{ marginTop: 32, marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={isPending}
              disabled={!canEdit}
              style={{ borderRadius: 'var(--radius-m)', height: '48px', padding: '0 32px' }}
            >
              {formDetails.submit_label || 'Salvar e Continuar'}
            </Button>
          </Form.Item>
        </Form>
      </Space>
    </div>
  )
}
