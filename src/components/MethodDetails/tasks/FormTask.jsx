import { useState } from 'react'
import { Spin, Flex } from 'antd'
import { useFormTask } from '../../../hooks/useProcesses'
import { FormRenderer } from './FormRenderer'

export function FormTask({ task, onToggle }) {
  const { fields, isLoadingFields, answers, isLoadingAnswers, saveAnswers } = useFormTask(task.task_id, task.id)
  const [localAnswers, setLocalAnswers] = useState(null)

  const currentAnswers = localAnswers || answers || {}

  const handleFieldChange = (fieldId, value) => {
    const updated = { ...currentAnswers, [fieldId]: value }
    setLocalAnswers(updated)
    // Persist answers on every change in database
    saveAnswers({ instanceTaskId: task.id, answers: updated })
  }

  const handleSubmit = () => {
    // Save answers and trigger task completion
    saveAnswers({ instanceTaskId: task.id, answers: currentAnswers })
    onToggle()
  }

  const handleReopen = () => {
    onToggle() // Marks task as pending (reopens it for editing)
  }

  if (isLoadingFields || isLoadingAnswers) {
    return (
      <Flex justify="center" align="center" style={{ padding: '20px' }}>
        <Spin tip="Carregando formulário..." />
      </Flex>
    )
  }

  return (
    <FormRenderer
      fields={fields}
      values={currentAnswers}
      onFieldChange={handleFieldChange}
      isCompleted={task.is_completed}
      onSubmit={handleSubmit}
      onReopen={handleReopen}
    />
  )
}
