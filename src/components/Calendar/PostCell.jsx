import { useDroppable } from '@dnd-kit/core';
import PostCard from '../Posts/PostCard';

export default function PostCell({ cellKey, posts, onAddPost, onEditPost, viewMode, isToday, isPast, columnWidth, rowHeight, colors, isLaunchDay }) {
  const { setNodeRef, isOver } = useDroppable({ id: cellKey });

  return (
    <div
      ref={setNodeRef}
      className="shrink-0 border-r border-b flex flex-col gap-1 p-1 transition-colors group"
      style={{
        width: columnWidth,
        minHeight: rowHeight,
        backgroundColor: isOver
          ? 'rgba(59,130,246,0.1)'
          : isLaunchDay
          ? 'rgba(139, 92, 246, 0.08)'
          : isToday
          ? 'rgba(59,130,246,0.04)'
          : isPast
          ? 'rgba(0,0,0,0.15)'
          : 'transparent',
        opacity: isPast && !isLaunchDay ? 0.7 : 1,
        borderColor: colors.borderLight,
        outline: isOver ? '2px solid rgba(59,130,246,0.4)' : 'none',
        outlineOffset: '-2px',
        boxSizing: 'border-box',
      }}
    >
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          cellKey={cellKey}
          onClick={() => onEditPost(post, cellKey)}
          viewMode={viewMode}
          colors={colors}
        />
      ))}
      <button
        onClick={() => onAddPost(cellKey)}
        className="opacity-0 group-hover:opacity-100 focus:opacity-100 w-full text-center text-[10px] py-0.5 rounded transition-opacity mt-auto shrink-0"
        style={{ color: colors.textFaint, backgroundColor: 'rgba(255,255,255,0.03)' }}
      >
        + post
      </button>
    </div>
  );
}
