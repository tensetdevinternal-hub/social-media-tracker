import { STATUSES } from '../../constants/statuses';
import { PLATFORMS } from '../../constants/platforms';
import { formatPostDate } from '../../utils/dateUtils';

export default function ListView({ platforms, posts, filteredPostIds, hasFilter, onEditPost, colors }) {
  // Build flat list: { post, cellKey, date, accountName, platformName }
  const accountMap = {};
  platforms.forEach((p) => {
    p.accounts.forEach((a) => {
      accountMap[a.id] = { accountName: a.name, platformName: p.name };
    });
  });

  const rows = [];
  Object.entries(posts).forEach(([cellKey, postsArr]) => {
    const accountId = cellKey.slice(0, -11);
    const date = cellKey.slice(-10);
    const { accountName = '', platformName = '' } = accountMap[accountId] || {};
    postsArr.forEach((post) => {
      if (hasFilter && filteredPostIds && !filteredPostIds.has(post.id)) return;
      rows.push({ post, cellKey, date, accountName, platformName });
    });
  });

  rows.sort((a, b) => a.date.localeCompare(b.date));

  const today = new Date().toISOString().slice(0, 10);

  const thStyle = {
    padding: '8px 12px',
    textAlign: 'left',
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: colors.textFaint,
    borderBottom: `1px solid ${colors.borderLight}`,
    position: 'sticky',
    top: 0,
    backgroundColor: colors.cardBg,
    zIndex: 1,
  };

  const tdStyle = {
    padding: '8px 12px',
    fontSize: 13,
    borderBottom: `1px solid ${colors.borderLight}`,
    color: colors.text,
    verticalAlign: 'middle',
  };

  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center flex-1 py-16">
        <div className="text-center">
          <p className="text-sm font-medium mb-1" style={{ color: colors.textMuted }}>No posts found</p>
          <p className="text-xs" style={{ color: colors.textFaint }}>
            {hasFilter ? 'Try clearing your filters' : 'Switch to Calendar view and add posts'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto" style={{ backgroundColor: colors.bg }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
        <thead>
          <tr>
            <th style={thStyle}>Date</th>
            <th style={thStyle}>Platform</th>
            <th style={thStyle}>Account</th>
            <th style={thStyle}>Title</th>
            <th style={thStyle}>Caption</th>
            <th style={thStyle}>Media</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ post, cellKey, date, accountName, platformName }) => {
            const isPast = date < today;
            const isOverdue = isPast && post.captionStatus !== 'posted';
            const captionCfg = STATUSES[post.captionStatus] || STATUSES.not_started;
            const mediaCfg = STATUSES[post.mediaStatus] || STATUSES.not_started;
            const platformColor = PLATFORMS[platformName]?.color || '#666';

            return (
              <tr
                key={`${cellKey}-${post.id}`}
                onClick={() => onEditPost(post, cellKey)}
                style={{
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                  opacity: isPast && !isOverdue ? 0.6 : 1,
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td style={{ ...tdStyle, color: isPast ? colors.textMuted : colors.text, whiteSpace: 'nowrap' }}>
                  {isOverdue && (
                    <span className="inline-block mr-1.5 text-[9px] font-medium px-1 py-0.5 rounded" style={{ backgroundColor: '#78350f', color: '#f59e0b' }}>
                      overdue
                    </span>
                  )}
                  {formatPostDate(date)}
                </td>
                <td style={tdStyle}>
                  <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ backgroundColor: `${platformColor}22`, color: platformColor }}>
                    {platformName}
                  </span>
                </td>
                <td style={{ ...tdStyle, color: colors.textMuted }}>{accountName}</td>
                <td style={{ ...tdStyle, maxWidth: 300 }}>
                  <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {post.title}
                  </span>
                </td>
                <td style={tdStyle}>
                  <span className="text-xs font-medium" style={{ color: captionCfg.color }}>{captionCfg.label}</span>
                </td>
                <td style={tdStyle}>
                  <span className="text-xs font-medium" style={{ color: mediaCfg.color }}>{mediaCfg.label}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
