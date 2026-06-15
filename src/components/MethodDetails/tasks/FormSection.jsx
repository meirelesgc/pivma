import { TextInput } from './TextInput'
import { IntegerInput } from './IntegerInput'
import { FloatInput } from './FloatInput'
import { UploadInput } from './UploadInput'
import { Typography, Card } from 'antd'

const { Title } = Typography

export function FormSection({ title, fields, values, onFieldChange, disabled }) {
  const renderFieldInput = (field) => {
    const props = {
      key: field.id,
      field,
      value: values[field.id],
      onChange: (val) => onFieldChange(field.id, val),
      disabled
    }

    switch (field.type) {
      case 'text':
        return <TextInput {...props} />
      case 'int':
        return <IntegerInput {...props} />
      case 'float':
        return <FloatInput {...props} />
      case 'upload':
        return <UploadInput {...props} />
      default:
        return null
    }
  }

  return (
    <Card 
      title={<Title level={5} style={{ margin: 0, fontFamily: 'Barlow, sans-serif', fontSize: '16px' }}>{title}</Title>}
      style={{ marginBottom: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}
      bodyStyle={{ padding: '20px' }}
    >
      {fields.map(renderFieldInput)}
    </Card>
  )
}
