/* eslint-disable no-unused-vars */
import { Space, Typography } from 'antd'

const { Paragraph } = Typography

export function CheckTask({ task }) {
  return (
    <Space direction="vertical" style={{ width: '100%' }} size={12}>
      <Paragraph style={{ fontFamily: 'Lexend, sans-serif', margin: 0 }}>
        Esta é uma tarefa de <strong>Checagem</strong>. Valide se todos os itens de conformidade técnica e funcional foram atendidos.
      </Paragraph>
    </Space>
  )
}
