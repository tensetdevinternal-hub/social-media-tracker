import { STATUSES } from '../../constants/statuses';
import { PLATFORM_NAMES } from '../../constants/platforms';

export default function FilterBar({ filterText, filterStatus, filterPlatform, onFilterTextChange, onFilterStatusChange, onFilterPlatformChange, colors }) {
  const hasFilters = filterText || filterStatus !== 'all' || filterPlatform !== 'all';

  const inputStyle = {
    backgroundColor: colors.inputBg,
    border: `1px solid ${colors.inputBorder}`,
    color: colors.text,
  };

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer',
  };

  return (
    <div
      className="flex flex-wrap items-center gap-2 px-4 py-2 border-b"
      style={{ borderColor: colors.borderLight, backgroundColor: colors.bg }}
    >
      {/* Search input */}
      <div className="relative flex-1 min-w-[180px] max-w-xs">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: colors.textFaint }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </span>
        <input
          type="text"
          placeholder="Search posts..."
          value={filterText}
          onChange={(e) => onFilterTextChange(e.target.value)}
          className="w-full pl-7 pr-3 py-1.5 rounded-lg text-xs outline-none"
          style={inputStyle}
        />
      </div>

      {/* Status filter */}
      <select
        value={filterStatus}
        onChange={(e) => onFilterStatusChange(e.target.value)}
        className="px-2 py-1.5 rounded-lg text-xs outline-none"
        style={selectStyle}
      >
        <option value="all">All Statuses</option>
        {Object.entries(STATUSES).map(([key, cfg]) => (
          <option key={key} value={key}>{cfg.label}</option>
        ))}
      </select>

      {/* Platform filter */}
      <select
        value={filterPlatform}
        onChange={(e) => onFilterPlatformChange(e.target.value)}
        className="px-2 py-1.5 rounded-lg text-xs outline-none"
        style={selectStyle}
      >
        <option value="all">All Platforms</option>
        {PLATFORM_NAMES.map((name) => (
          <option key={name} value={name}>{name}</option>
        ))}
      </select>

      {/* Clear filters */}
      {hasFilters && (
        <button
          onClick={() => {
            onFilterTextChange('');
            onFilterStatusChange('all');
            onFilterPlatformChange('all');
          }}
          className="px-2 py-1.5 rounded-lg text-xs transition-colors hover:opacity-80"
          style={{ backgroundColor: colors.buttonBg, color: colors.textMuted }}
        >
          Clear
        </button>
      )}
    </div>
  );
}
