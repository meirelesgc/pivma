import useMockStore from '../../../store/useMockStore';

const FieldReview = ({ processId, fieldId }) => {
  const { user, processes, addComment, resolveComment } = useMockStore();
  const process = processes.find(p => p.id === processId);
  const comments = process?.comments?.[fieldId] || [];
  const pendingComments = comments.filter(c => c.status === 'pending');

  const handleAddComment = () => {
    const text = prompt('Insira sua observação técnica para este campo:');
    if (!text) return;

    const type = prompt('Tipo de observação (1: Pendência Documental, 2: Inconsistência Técnica, 3: Sugestão):');
    let typeLabel = 'suggestion';
    if (type === '1') typeLabel = 'pendency';
    if (type === '2') typeLabel = 'technical';

    addComment(processId, fieldId, {
      text,
      type: typeLabel
    });
  };

  if (user.role !== 'Admin' && pendingComments.length === 0) return null;

  return (
    <div className={`field-review-container ${pendingComments.length > 0 ? 'has-pending' : ''}`}>
      {user.role === 'Admin' && (
        <button 
          type="button" 
          className="field-comment-trigger" 
          onClick={handleAddComment}
          title="Adicionar observação técnica"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="10" y1="10" x2="14" y2="10"></line>
          </svg>
        </button>
      )}

      {pendingComments.map(comment => (
        <div key={comment.id} className="comment-box">
          <div className="comment-header">
            <span className="comment-author">{comment.author}</span>
            <span className="comment-time">
              {new Date(comment.timestamp).toLocaleDateString('pt-BR')}
            </span>
          </div>
          <div className={`comment-type-tag type-${comment.type}`}>
            {comment.type === 'pendency' ? 'Pendência' : comment.type === 'technical' ? 'Técnico' : 'Sugestão'}
          </div>
          <div className="comment-text">{comment.text}</div>
          
          {user.role === 'Admin' && (
            <div className="comment-actions">
              <button 
                type="button" 
                className="action-btn resolve"
                onClick={() => resolveComment(processId, fieldId, comment.id)}
              >
                Resolvido
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FieldReview;
