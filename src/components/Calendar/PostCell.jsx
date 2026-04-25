import { Fragment, useState } from 'react';
import { useDroppable, useDndMonitor } from '@dnd-kit/core';
import PostCard from '../Posts/PostCard';

function InsertSlot({ id }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{
        height: 10,
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
        padding: '0 2px',
      }}
    >
      <div
        style={{
          height: isOver ? 3 : 1,
          width: '100%',
          backgroundColor: isOver ? '#3b82f6' : 'rgba(59,130,246,0.2)',
          borderRadius: 2,
          transition: 'height 0.1s, background-color 0.1s',
          boxShadow: isOver ? '0 0 6px rgba(59,130,246,0.5)' : 'none',
        }}
      />
    </div>
  );
}

export default function PostCell({ cellKey, posts, onAddPost, onEditPost, viewMode, isToday, isPast, columnWidth, rowHeight, colors, isLaunchDay }) {
  const { setNodeRef, isOver } = useDroppable({ id: cellKey });
  const [isDragging, setIsDragging] = useState(false);
  const [isAnySlotOver, setIsAnySlotOver] = useState(false);

  useDndMonitor({
    onDragStart() { setIsDragging(true); },
    onDragEnd() { setIsDragging(false); setIsAnySlotOver(false); },
    onDragCancel() { setIsDragging(false); setIsAnySlotOver(false); },
    onDragOver(event) {
      const overId = String(event.over?.id ?? '');
      setIsAnySlotOver(overId.startsWith(`${cellKey}::`));
    },
  });

  const showSlots = isDragging && posts.length > 0;
  const highlightCell = isOver || isAnySlotOver;

  return (
    <div
      ref={setNodeRef}
      className="shrink-0 border-r border-b flex flex-col gap-1 p-1 transition-colors group"
      style={{
        width: columnWidth,
        minHeight: rowHeight,
        backgroundColor: highlightCell
          ? 'rgba(59,130,246,0.08)'
          : isLaunchDay
          ? 'rgba(139, 92, 246, 0.08)'
          : isToday
          ? 'rgba(59,130,246,0.04)'
          : isPast
          ? 'rgba(0,0,0,0.15)'
          : 'transparent',
        opacity: isPast && !isLaunchDay ? 0.7 : 1,
        borderColor: colors.borderLight,
        outline: isOver && posts.length === 0 ? '2px solid rgba(59,130,246,0.4)' : 'none',
        outlineOffset: '-2px',
        boxSizing: 'border-box',
      }}
    >
      {showSlots && <InsertSlot id={`${cellKey}::0`} />}
      {posts.map((post, i) => (
        <Fragment key={post.id}>
          <PostCard
            post={post}
            cellKey={cellKey}
            onClick={() => onEditPost(post, cellKey)}
            viewMode={viewMode}
            colors={colors}
          />
          {showSlots && <InsertSlot id={`${cellKey}::${i + 1}`} />}
        </Fragment>
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
