/* eslint-disable no-unused-vars */
import { Space, Typography } from 'antd'

const { Paragraph } = Typography

export function CalendarTask({ task }) {
  return (
    <Space direction="vertical" style={{ width: '100%' }} size={12}>
      <Paragraph style={{ fontFamily: 'Lexend, sans-serif', margin: 0 }}>
        Esta é uma tarefa de <strong>Calendário</strong>. Verifique e agende os prazos importantes ou reuniões associadas a esta etapa.
      </Paragraph>
    </Space>
  )
}
