/* eslint-disable no-unused-vars */
import { Typography } from 'antd'

const { Paragraph } = Typography

export function DefaultTask({ task }) {
  return (
    <Paragraph style={{ fontFamily: 'Lexend, sans-serif', margin: 0 }}>
      Tarefa padrão do fluxo de validação do método.
    </Paragraph>
  )
}
