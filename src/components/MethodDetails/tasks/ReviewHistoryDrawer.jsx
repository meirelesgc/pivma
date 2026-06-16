import { Drawer, Typography, Timeline, Card, Tag, Flex } from 'antd'
import { RobotOutlined, UserOutlined, CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography

export function ReviewHistoryDrawer({ open, onClose, fieldName, reviews }) {
  // Group reviews by review_round_id
  const reviewsByRound = reviews.reduce((acc, r) => {
    const round = r.review_round_id || 1
    if (!acc[round]) {
      acc[round] = []
    }
    acc[round].push(r)
    return acc
  }, {})

  // Sort rounds ascending (or descending? "agrupar por rodada de revisão, ordenar cronologicamente")
  // Let's sort rounds descending so the latest round is at the top, but comments inside each round are chronological (ascending)
  const sortedRounds = Object.keys(reviewsByRound).sort((a, b) => Number(b) - Number(a))

  return (
    <Drawer
      title={
        <div>
          <Title level={5} style={{ margin: 0, fontFamily: 'Barlow, sans-serif' }}>Histórico de Revisões</Title>
          <Text type="secondary" style={{ fontSize: '13px', fontFamily: 'Lexend, sans-serif' }}>{fieldName}</Text>
        </div>
      }
      placement="right"
      width={450}
      onClose={onClose}
      open={open}
      style={{ fontFamily: 'Lexend, sans-serif' }}
    >
      {reviews.length === 0 ? (
        <Flex vertical align="center" justify="center" style={{ height: '100%', padding: '24px' }}>
          <InfoCircleOutlined style={{ fontSize: '36px', color: '#bfbfbf', marginBottom: '12px' }} />
          <Text type="secondary">Nenhuma revisão registrada para este campo.</Text>
        </Flex>
      ) : (
        <Flex vertical gap={24}>
          {sortedRounds.map(round => {
            const roundReviews = reviewsByRound[round].sort((a, b) => a.id - b.id)

            return (
              <div key={round} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '16px' }}>
                <Title level={5} style={{ marginBottom: '12px', color: '#1677ff', fontSize: '14px' }}>
                  Rodada de Revisão #{round}
                </Title>
                
                <Timeline
                  items={roundReviews.map(r => {
                    const isIA = r.reviewer_role === 'ia'
                    const statusTag = r.status === 'active' ? (
                      <Tag color="warning" style={{ borderRadius: '4px', fontSize: '10px' }}>Ativo</Tag>
                    ) : (
                      <Tag color="success" icon={<CheckCircleOutlined />} style={{ borderRadius: '4px', fontSize: '10px' }}>Resolvido</Tag>
                    )

                    return {
                      color: r.status === 'active' ? 'gold' : 'green',
                      dot: isIA ? (
                        <RobotOutlined style={{ fontSize: '16px', color: '#722ed1' }} />
                      ) : (
                        <UserOutlined style={{ fontSize: '16px', color: '#1890ff' }} />
                      ),
                      children: (
                        <Card
                          size="small"
                          style={{
                            borderRadius: '8px',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.01)',
                            border: '1px solid #f0f0f0',
                            backgroundColor: r.status === 'active' ? '#fffbe6' : '#fafafa'
                          }}
                          bodyStyle={{ padding: '8px 12px' }}
                        >
                          <Flex justify="space-between" align="center" style={{ marginBottom: '6px' }}>
                            <Text strong style={{ fontSize: '12px' }}>
                              {isIA ? 'Validação por IA' : `Revisor: ${r.reviewer_role.toUpperCase()}`}
                            </Text>
                            {statusTag}
                          </Flex>
                          <Paragraph style={{ margin: 0, fontSize: '13px', color: '#595959' }}>
                            {r.comment}
                          </Paragraph>
                        </Card>
                      )
                    }
                  })}
                />
              </div>
            )
          })}
        </Flex>
      )}
    </Drawer>
  )
}
