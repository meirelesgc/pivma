import { Typography } from 'antd'
import { KanbanBoard } from '../components/KanbanBoard'

const { Title } = Typography

export function ActivitiesPage() {
  return (
    <main className="workspace-content fade-in" style={{ padding: '24px', maxWidth: '100%', overflowX: 'hidden' }}>
      <div style={{ marginBottom: 20 }}>
        <Title level={2} style={{ margin: 0, fontFamily: "var(--font-accent)" }}>
          Quadro de Atividades
        </Title>
      </div>
      <KanbanBoard />
    </main>
  )
}
