import { formatTimestamp } from '../../utils/formatters';

export default function CommentItem({ comment, onResolve, onDelete, colors }) {
  return (
    <div
      className="p-2 rounded-lg"
      style={{
        backgroundColor: colors.inputBg,
        opacity: comment.resolved ? 0.6 : 1,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-xs font-medium" style={{ color: colors.text }}>
              {comment.author}
            </span>
            <span className="text-[10px]" style={{ color: colors.textFaint }}>
              {formatTimestamp(comment.timestamp)}
            </span>
          </div>
          <p
            className="text-xs break-words"
            style={{
              color: colors.textMuted,
              textDecoration: comment.resolved ? 'line-through' : 'none',
            }}
          >
            {comment.text}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onResolve(comment.id)}
            className="text-[10px] px-1.5 py-0.5 rounded transition-colors hover:opacity-80"
            style={{
              backgroundColor: comment.resolved ? '#064e3b' : colors.buttonBg,
              color: comment.resolved ? '#10b981' : colors.textFaint,
            }}
            title={comment.resolved ? 'Unresolve' : 'Resolve'}
          >
            {comment.resolved ? '✓' : '○'}
          </button>
          <button
            onClick={() => onDelete(comment.id)}
            className="text-[10px] px-1.5 py-0.5 rounded transition-colors hover:opacity-80"
            style={{ backgroundColor: colors.buttonBg, color: colors.textFaint }}
            title="Delete"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
