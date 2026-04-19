import SegmentedControl from './SegmentedControl';
import { formatWeekRange } from '../../utils/dateUtils';

export default function Navigation({
  weekDates,
  weekSpan,
  viewMode,
  onPrev,
  onNext,
  onToday,
  onWeekSpanChange,
  onViewModeChange,
  onAddPlatform,
  onAddAccount,
  hasPlatforms,
  hiddenCount,
  colors,
}) {
  const rangeStr = formatWeekRange(weekDates);

  return (
    <div
      className="flex flex-wrap items-center gap-2 px-4 py-3 border-b"
      style={{ borderColor: colors.borderLight, backgroundColor: colors.cardBg }}
    >
      {/* Week nav */}
      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-sm transition-colors hover:opacity-80"
          style={{ backgroundColor: colors.buttonBg, color: colors.text }}
          title="Previous week"
        >
          ‹
        </button>
        <span className="text-sm font-medium min-w-[160px] text-center" style={{ color: colors.text }}>
          {rangeStr}
        </span>
        <button
          onClick={onNext}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-sm transition-colors hover:opacity-80"
          style={{ backgroundColor: colors.buttonBg, color: colors.text }}
          title="Next week"
        >
          ›
        </button>
        <button
          onClick={onToday}
          className="px-3 py-1 rounded-lg text-xs font-medium transition-colors hover:opacity-80"
          style={{ backgroundColor: colors.buttonBg, color: colors.textMuted }}
        >
          Today
        </button>
      </div>

      <div className="flex-1" />

      {/* Hidden count indicator */}
      {hiddenCount > 0 && (
        <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#78350f', color: '#f59e0b' }}>
          {hiddenCount} post{hiddenCount !== 1 ? 's' : ''} hidden
        </span>
      )}

      {/* View mode toggle */}
      <SegmentedControl
        options={[
          { label: 'Title', value: 'title' },
          { label: 'Caption', value: 'caption' },
        ]}
        value={viewMode}
        onChange={onViewModeChange}
        colors={colors}
      />

      {/* Week span toggle */}
      <SegmentedControl
        options={[
          { label: '1 Week', value: 1 },
          { label: '2 Weeks', value: 2 },
        ]}
        value={weekSpan}
        onChange={onWeekSpanChange}
        colors={colors}
      />

      {/* Add buttons */}
      <div className="flex items-center gap-2">
        {hasPlatforms && (
          <button
            onClick={onAddAccount}
            className="px-3 py-1 rounded-lg text-xs font-medium transition-colors hover:opacity-80"
            style={{ backgroundColor: colors.buttonBg, color: colors.textMuted }}
          >
            + Account
          </button>
        )}
        <button
          onClick={onAddPlatform}
          className="px-3 py-1 rounded-lg text-xs font-medium transition-colors hover:opacity-80"
          style={{ backgroundColor: '#1e3a5a', color: '#3b82f6' }}
        >
          + Platform
        </button>
      </div>
    </div>
  );
}
