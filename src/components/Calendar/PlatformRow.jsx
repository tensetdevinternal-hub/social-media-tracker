import { PLATFORMS } from '../../constants/platforms';
import AccountRow from './AccountRow';

const FROZEN_WIDTH = 160;
const DEFAULT_ROW_HEIGHT = 90;

export default function PlatformRow({
  platform,
  dates,
  posts,
  filteredPostIds,
  hasFilter,
  collapsed,
  columnWidth,
  rowHeights,
  defaultRowHeight,
  onToggleCollapse,
  onAddPost,
  onEditPost,
  onDeletePlatform,
  onDeleteAccount,
  onRowResizeStart,
  viewMode,
  colors,
}) {
  const platformConfig = PLATFORMS[platform.name] || {};

  return (
    <div>
      {/* Platform header row */}
      <div className="flex group" style={{ minWidth: 'max-content' }}>
        <div
          className="shrink-0 flex items-center justify-between px-3 py-2 border-r border-b cursor-pointer select-none"
          style={{
            width: FROZEN_WIDTH,
            backgroundColor: `${platformConfig.color || '#666'}15`,
            borderColor: colors.border,
            position: 'sticky',
            left: 0,
            zIndex: 5,
          }}
          onClick={() => onToggleCollapse(platform.id)}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-sm shrink-0">{platformConfig.icon || '📱'}</span>
            <span className="text-xs font-medium truncate" style={{ color: colors.text }}>
              {platform.name}
            </span>
            <span
              className="text-[10px] transition-transform shrink-0"
              style={{ color: colors.textFaint, transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}
            >
              ▾
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`Delete platform "${platform.name}" and ALL its accounts/posts?`))
                onDeletePlatform(platform.id);
            }}
            className="opacity-0 group-hover:opacity-50 hover:!opacity-100 text-xs transition-opacity shrink-0 ml-1"
            style={{ color: '#ef4444' }}
            title="Delete platform"
          >
            ×
          </button>
        </div>

        {/* Platform header spacer cells */}
        {dates.map((date) => (
          <div
            key={date.toISOString()}
            className="shrink-0 border-r border-b py-2"
            style={{
              width: columnWidth,
              backgroundColor: `${platformConfig.color || '#666'}08`,
              borderColor: colors.borderLight,
            }}
          />
        ))}
      </div>

      {/* Account rows */}
      {!collapsed &&
        platform.accounts.map((account) => (
          <AccountRow
            key={account.id}
            account={account}
            dates={dates}
            posts={posts}
            filteredPostIds={filteredPostIds}
            hasFilter={hasFilter}
            columnWidth={columnWidth}
            rowHeight={rowHeights[account.id] ?? (defaultRowHeight || DEFAULT_ROW_HEIGHT)}
            onAddPost={onAddPost}
            onEditPost={onEditPost}
            onDeleteAccount={onDeleteAccount}
            onRowResizeStart={onRowResizeStart}
            viewMode={viewMode}
            colors={colors}
          />
        ))}
    </div>
  );
}
