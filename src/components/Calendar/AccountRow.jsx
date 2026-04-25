import { formatDate } from '../../utils/dateUtils';
import PostCell from './PostCell';

const FROZEN_WIDTH = 160;

export default function AccountRow({
  account,
  dates,
  posts,
  filteredPostIds,
  hasFilter,
  columnWidth,
  rowHeight,
  onAddPost,
  onEditPost,
  onDeleteAccount,
  onRowResizeStart,
  viewMode,
  colors,
}) {
  const today = formatDate(new Date());

  return (
    <div className="flex relative group/row" style={{ minWidth: 'max-content' }}>
      {/* Account label — frozen */}
      <div
        className="shrink-0 flex items-center justify-between px-3 border-r border-b"
        style={{
          width: FROZEN_WIDTH,
          height: rowHeight,
          backgroundColor: colors.cardBg,
          borderColor: colors.borderLight,
          position: 'sticky',
          left: 0,
          zIndex: 5,
          boxSizing: 'border-box',
        }}
      >
        <span className="text-xs truncate" style={{ color: colors.textMuted }} title={account.name}>
          {account.name}
        </span>
        <button
          onClick={() => {
            if (window.confirm(`Delete account "${account.name}"? This will remove all its posts.`))
              onDeleteAccount(account.id);
          }}
          className="opacity-0 group-hover/row:opacity-50 hover:!opacity-100 text-xs transition-opacity shrink-0 ml-1"
          style={{ color: '#ef4444' }}
          title="Delete account"
        >
          ×
        </button>
      </div>

      {/* Post cells */}
      {dates.map((date) => {
        const dateKey = formatDate(date);
        const cellKey = `${account.id}-${dateKey}`;
        const allPosts = posts[cellKey] || [];
        const displayPosts = hasFilter
          ? allPosts.filter((p) => filteredPostIds.has(p.id))
          : allPosts;

        return (
          <PostCell
            key={cellKey}
            cellKey={cellKey}
            posts={displayPosts}
            onAddPost={onAddPost}
            onEditPost={onEditPost}
            viewMode={viewMode}
            isToday={dateKey === today}
            isPast={dateKey < today}
            columnWidth={columnWidth}
            rowHeight={rowHeight}
            colors={colors}
          />
        );
      })}

      {/* Row resize handle — bottom edge */}
      <div
        onPointerDown={(e) => onRowResizeStart(e, account.id)}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 6,
          cursor: 'row-resize',
          zIndex: 6,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}
        title="Drag to resize row"
      >
        {/* Visual pip */}
        <div
          className="opacity-0 group-hover/row:opacity-100 transition-opacity"
          style={{
            width: 32,
            height: 2,
            borderRadius: 1,
            marginBottom: 1,
            backgroundColor: 'rgba(255,255,255,0.2)',
          }}
        />
      </div>
    </div>
  );
}
