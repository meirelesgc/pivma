import { Input, Form } from 'antd'

export function IntegerInput({ field, value, onChange, disabled }) {
  const handleChange = (e) => {
    const cleanValue = e.target.value.replace(/[^0-9]/g, '')
    onChange(cleanValue)
  }

  return (
    <Form.Item
      label={field.name}
      required
      style={{ marginBottom: '16px', fontFamily: 'Lexend, sans-serif' }}
    >
      <Input
        value={value || ''}
        onChange={handleChange}
        disabled={disabled}
        placeholder={`Digite um número inteiro para ${field.name.toLowerCase()}...`}
        style={{ borderRadius: '8px' }}
      />
    </Form.Item>
  )
}
