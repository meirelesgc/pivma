 
import { Space, Typography } from 'antd'

const { Paragraph } = Typography

export function ReviewTask({ task: _task }) {
  return (
    <Space direction="vertical" style={{ width: '100%' }} size={12}>
      <Paragraph style={{ fontFamily: 'Lexend, sans-serif', margin: 0 }}>
        Esta é uma tarefa de <strong>Revisão</strong>. Analise cuidadosamente a documentação e os registros anexados.
      </Paragraph>
    </Space>
  )
}
