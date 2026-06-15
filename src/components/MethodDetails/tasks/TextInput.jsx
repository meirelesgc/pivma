import { Input, Form } from 'antd'

export function TextInput({ field, value, onChange, disabled }) {
  return (
    <Form.Item
      label={field.name}
      required
      style={{ marginBottom: '16px', fontFamily: 'Lexend, sans-serif' }}
    >
      <Input
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={`Digite o ${field.name.toLowerCase()}...`}
        style={{ borderRadius: '8px' }}
      />
    </Form.Item>
  )
}
