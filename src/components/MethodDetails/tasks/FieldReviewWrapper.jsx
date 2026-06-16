import { useState } from 'react'
import { Flex, Button, Popover, Input, Space, Badge, Typography } from 'antd'
import { WarningOutlined, HistoryOutlined } from '@ant-design/icons'
import { ReviewHistoryDrawer } from './ReviewHistoryDrawer'

const { Text } = Typography

export function FieldReviewWrapper({
  field,
  roleMode,
  activeReviews = [],
  allReviews = [],
  onAddReviewComment,
  children
}) {
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)

  const hasActiveReviews = activeReviews.length > 0
  const isRevisorMode = roleMode === 'revisor'
  const isProponenteMode = roleMode === 'proponente'

  const handleSaveComment = () => {
    if (!commentText.trim()) return
    onAddReviewComment(commentText)
    setCommentText('')
    setPopoverOpen(false)
  }

  // Wrapper styles
  const wrapperStyle = hasActiveReviews && isProponenteMode ? {
    backgroundColor: '#fffbe6',
    border: '1.5px solid #ffe58f',
    padding: '16px',
    borderRadius: '12px',
    marginBottom: '16px',
    transition: 'all 0.3s ease',
    position: 'relative'
  } : {
    marginBottom: '16px',
    position: 'relative'
  }

  const renderRevisorAction = () => {
    if (!isRevisorMode) return null

    const popoverContent = (
      <Space direction="vertical" style={{ width: '250px', fontFamily: 'Lexend, sans-serif' }}>
        <Text strong style={{ fontSize: '13px' }}>Adicionar apontamento:</Text>
        <Input.TextArea
          rows={3}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Digite o motivo do apontamento neste campo..."
          style={{ borderRadius: '6px' }}
        />
        <Flex justify="end" gap={8} style={{ marginTop: '8px' }}>
          <Button size="small" onClick={() => setPopoverOpen(false)}>Cancelar</Button>
          <Button size="small" type="primary" onClick={handleSaveComment} disabled={!commentText.trim()}>
            Salvar
          </Button>
        </Flex>
      </Space>
    )

    return (
      <Popover
        content={popoverContent}
        title="Sinalizar Problema"
        trigger="click"
        open={popoverOpen}
        onOpenChange={setPopoverOpen}
        placement="topRight"
      >
        <Button
          type="dashed"
          danger
          size="small"
          icon={<WarningOutlined />}
          style={{ borderRadius: '6px', fontSize: '12px' }}
        >
          Apontar Problema
        </Button>
      </Popover>
    )
  }

  return (
    <div style={wrapperStyle}>
      <Flex justify="space-between" align="center" style={{ marginBottom: '8px' }}>
        <div>
          {hasActiveReviews && isProponenteMode && (
            <Badge
              status="warning"
              text={
                <Text
                  strong
                  style={{
                    color: '#d46b08',
                    cursor: 'pointer',
                    fontSize: '12px',
                    textDecoration: 'underline'
                  }}
                  onClick={() => setDrawerOpen(true)}
                >
                  <WarningOutlined style={{ marginRight: 4 }} />
                  Apontamento ativo. Clique para ver histórico.
                </Text>
              }
            />
          )}
        </div>
        
        <Flex gap={8}>
          {renderRevisorAction()}
          {allReviews.length > 0 && (
            <Button
              type="text"
              size="small"
              icon={<HistoryOutlined />}
              onClick={() => setDrawerOpen(true)}
              style={{ fontSize: '12px', color: '#8c8c8c' }}
            >
              Histórico ({allReviews.length})
            </Button>
          )}
        </Flex>
      </Flex>

      {/* Render the actual input field */}
      {children}

      {/* Exibir apontamentos ativos abaixo do campo se estiver em modo Revisor para feedback visual */}
      {isRevisorMode && hasActiveReviews && (
        <div style={{ marginTop: '8px', padding: '8px 12px', backgroundColor: '#fffbe6', borderLeft: '3px solid #ffe58f', borderRadius: '4px' }}>
          <Text strong style={{ fontSize: '11px', color: '#d46b08', display: 'block', marginBottom: '4px' }}>
            Apontamentos ativos nesta rodada:
          </Text>
          {activeReviews.map(rev => (
            <div key={rev.id} style={{ fontSize: '12px', color: '#595959', marginBottom: '4px' }}>
              • <strong>{rev.reviewer_role === 'ia' ? 'IA' : rev.reviewer_role.toUpperCase()}:</strong> {rev.comment}
            </div>
          ))}
        </div>
      )}

      <ReviewHistoryDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        fieldName={field.name}
        reviews={allReviews}
      />
    </div>
  )
}
