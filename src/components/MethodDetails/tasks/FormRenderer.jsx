import { useState, useMemo } from 'react'
import { Steps, Button, Space, message, Flex, Alert } from 'antd'
import { FormSection } from './FormSection'
import { LeftOutlined, RightOutlined, CheckOutlined, EditOutlined } from '@ant-design/icons'

export function FormRenderer({
  fields,
  values,
  onFieldChange,
  isCompleted,
  disabled,
  roleMode,
  activeReviews = [],
  allReviews = [],
  onAddReviewComment,
  onSubmit,
  onReopen
}) {
  const [currentStep, setCurrentStep] = useState(0)

  // Group fields by section
  const sectionsMap = useMemo(() => {
    const map = {}
    fields.forEach(f => {
      const sectionName = f.section || 'Geral'
      if (!map[sectionName]) {
        map[sectionName] = []
      }
      map[sectionName].push(f)
    })
    return map
  }, [fields])

  // Sort sections alphabetically (assures "1. Identificação" is first, etc.)
  const sortedSections = useMemo(() => {
    return Object.keys(sectionsMap).sort()
  }, [sectionsMap])

  const activeSection = sortedSections[currentStep]
  const activeFields = useMemo(() => {
    return sectionsMap[activeSection] || []
  }, [sectionsMap, activeSection])

  // Check if all fields in the current section are filled
  const isCurrentSectionValid = useMemo(() => {
    if (!activeFields.length) return true
    return activeFields.every(field => {
      const val = values[field.id]
      return val !== undefined && val !== null && String(val).trim() !== ''
    })
  }, [activeFields, values])

  // Check if all fields in the entire form are filled
  const isFormValid = useMemo(() => {
    return fields.every(field => {
      const val = values[field.id]
      return val !== undefined && val !== null && String(val).trim() !== ''
    })
  }, [fields, values])

  const handleNext = () => {
    if (!isCurrentSectionValid) {
      message.error('Por favor, preencha todos os campos obrigatórios da seção atual.')
      return
    }
    setCurrentStep(prev => Math.min(prev + 1, sortedSections.length - 1))
  }

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }

  if (sortedSections.length === 0) {
    return <Alert message="Nenhum campo disponível para este formulário." type="info" />
  }

  return (
    <div style={{ width: '100%', fontFamily: 'Lexend, sans-serif' }}>
      <Steps
        current={currentStep}
        onChange={(step) => {
          // Allow going backwards freely or going forwards only if intermediate steps are valid
          if (step < currentStep) {
            setCurrentStep(step)
          } else {
            // Check validation of all steps between current and target step
            let canNavigate = true
            for (let i = currentStep; i < step; i++) {
              const sec = sortedSections[i]
              const secFields = sectionsMap[sec] || []
              const secValid = secFields.every(f => {
                const val = values[f.id]
                return val !== undefined && val !== null && String(val).trim() !== ''
              })
              if (!secValid) {
                canNavigate = false
                message.error(`Preencha todos os campos de "${sec}" para prosseguir.`)
                break
              }
            }
            if (canNavigate) {
              setCurrentStep(step)
            }
          }
        }}
        items={sortedSections.map(sec => ({ title: sec }))}
        style={{ marginBottom: '24px' }}
        size="small"
      />

      <FormSection
        title={activeSection}
        fields={activeFields}
        values={values}
        onFieldChange={onFieldChange}
        disabled={disabled || isCompleted}
        roleMode={roleMode}
        activeReviews={activeReviews}
        allReviews={allReviews}
        onAddReviewComment={onAddReviewComment}
      />

      <Flex justify="space-between" style={{ marginTop: '20px' }}>
        <Space>
          <Button
            icon={<LeftOutlined />}
            onClick={handlePrev}
            disabled={currentStep === 0}
            style={{ borderRadius: '8px' }}
          >
            Anterior
          </Button>
          {currentStep < sortedSections.length - 1 ? (
            <Button
              type="primary"
              onClick={handleNext}
              disabled={!isCurrentSectionValid}
              style={{ borderRadius: '8px' }}
            >
              Próximo <RightOutlined />
            </Button>
          ) : (
            !(disabled || isCompleted) && (
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={onSubmit}
                disabled={!isFormValid}
                style={{
                  borderRadius: '8px',
                  backgroundColor: isFormValid ? '#52c41a' : undefined,
                  borderColor: isFormValid ? '#52c41a' : undefined,
                  color: isFormValid ? '#fff' : undefined
                }}
              >
                Enviar e Concluir Tarefa
              </Button>
            )
          )}
        </Space>

        {isCompleted && (
          <Button
            type="dashed"
            icon={<EditOutlined />}
            onClick={onReopen}
            style={{ borderRadius: '8px' }}
          >
            Refazer Formulário
          </Button>
        )}
      </Flex>
    </div>
  )
}
