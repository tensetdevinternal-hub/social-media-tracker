import { useRef } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { STATUSES } from '../../constants/statuses';

export default function PostCard({ post, cellKey, onClick, viewMode, colors }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: post.id,
    data: { postId: post.id, sourceCellKey: cellKey },
  });

  // Suppress click only if pointer moved far enough to count as a drag
  const didDrag = useRef(false);
  const pointerStart = useRef(null);
  const DRAG_THRESHOLD = 8;

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 999 }
    : undefined;

  const captionCfg = STATUSES[post.captionStatus] || STATUSES.not_started;
  const mediaCfg = STATUSES[post.mediaStatus] || STATUSES.not_started;
  const unresolvedComments = (post.comments || []).filter((c) => !c.resolved).length;
  const totalComments = (post.comments || []).length;

  const previewText = post.tweets
    ? post.tweets[0]?.text
    : post.content || '';

  const handlePointerDown = (e) => {
    didDrag.current = false;
    pointerStart.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e) => {
    if (!pointerStart.current) return;
    const dx = e.clientX - pointerStart.current.x;
    const dy = e.clientY - pointerStart.current.y;
    if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) {
      didDrag.current = true;
    }
  };

  const handleClick = (e) => {
    if (didDrag.current) return;
    onClick(e);
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onClick={handleClick}
      style={{
        ...style,
        opacity: isDragging ? 0.4 : 1,
        backgroundColor: colors.cellBg,
        border: `1px solid ${isDragging ? '#3b82f6' : colors.borderLight}`,
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none',
      }}
      className="rounded-lg p-2 relative select-none hover:border-gray-500 transition-colors"
    >
      {/* Status dots */}
      <div className="flex items-center gap-1 mb-1">
        <span
          className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
          style={{ backgroundColor: captionCfg.color }}
          title={`Caption: ${captionCfg.label}`}
        />
        <span
          className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
          style={{ backgroundColor: mediaCfg.color }}
          title={`Media: ${mediaCfg.label}`}
        />
        {totalComments > 0 && (
          <span
            className="text-[10px] ml-auto px-1 rounded shrink-0"
            style={{
              backgroundColor: unresolvedComments > 0 ? '#78350f' : colors.buttonBg,
              color: unresolvedComments > 0 ? '#f59e0b' : colors.textFaint,
            }}
          >
            {unresolvedComments > 0 ? `${unresolvedComments}!` : totalComments}
          </span>
        )}
      </div>

      {/* Title */}
      <p className="text-xs font-medium leading-tight break-words" style={{ color: colors.text }}>
        {post.title}
      </p>

      {/* Caption preview */}
      {viewMode === 'caption' && previewText && (
        <p className="text-[10px] leading-tight mt-0.5 break-words" style={{ color: colors.textMuted }}>
          {previewText}
          {post.tweets && post.tweets.length > 1 && (
            <span style={{ color: colors.textFaint }}> +{post.tweets.length - 1} more</span>
          )}
        </p>
      )}

      {/* Thread indicator */}
      {post.tweets && post.tweets.length > 1 && viewMode === 'title' && (
        <span className="text-[10px]" style={{ color: '#1da1f2' }}>
          🧵 {post.tweets.length} tweets
        </span>
      )}
    </div>
  );
}
