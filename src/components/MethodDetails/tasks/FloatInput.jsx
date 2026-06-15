import { Input, Form } from 'antd'

export function FloatInput({ field, value, onChange, disabled }) {
  const handleChange = (e) => {
    let val = e.target.value
    val = val.replace(',', '.')
    val = val.replace(/[^0-9.]/g, '')
    const parts = val.split('.')
    if (parts.length > 2) {
      val = parts[0] + '.' + parts.slice(1).join('')
    }
    onChange(val)
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
        placeholder={`Digite um número decimal para ${field.name.toLowerCase()} (ex: 10.5)...`}
        style={{ borderRadius: '8px' }}
      />
    </Form.Item>
  )
}
