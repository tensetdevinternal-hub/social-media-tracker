import CommentItem from './CommentItem';
import AddComment from './AddComment';

export default function CommentsList({ comments = [], onAdd, onResolve, onDelete, colors }) {
  const unresolvedCount = comments.filter((c) => !c.resolved).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-medium uppercase tracking-wider" style={{ color: colors.textFaint }}>
          Comments ({comments.length})
        </h4>
        {unresolvedCount > 0 && (
          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: '#78350f', color: '#f59e0b' }}>
            {unresolvedCount} open
          </span>
        )}
      </div>

      {comments.length > 0 && (
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onResolve={onResolve}
              onDelete={onDelete}
              colors={colors}
            />
          ))}
        </div>
      )}

      <AddComment onAdd={onAdd} colors={colors} />
    </div>
  );
}
