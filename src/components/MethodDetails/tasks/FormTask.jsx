/* eslint-disable no-unused-vars */
import { Space, Typography } from 'antd'

const { Paragraph } = Typography

export function FormTask({ task }) {
  return (
    <Space direction="vertical" style={{ width: '100%' }} size={12}>
      <Paragraph style={{ fontFamily: 'Lexend, sans-serif', margin: 0 }}>
        Esta é uma tarefa do tipo <strong>Formulário</strong>. Preencha todos os campos necessários para validação dos dados da etapa.
      </Paragraph>
    </Space>
  )
}
