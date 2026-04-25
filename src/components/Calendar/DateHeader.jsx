import { formatDate, formatDisplayDate } from '../../utils/dateUtils';

const FROZEN_WIDTH = 160;

export default function DateHeader({ dates, columnWidth, onColumnResizeStart, colors, launchDays, onToggleLaunchDay }) {
  const today = formatDate(new Date());

  return (
    <div
      className="flex"
      style={{ minWidth: 'max-content', position: 'sticky', top: 0, zIndex: 20 }}
    >
      {/* Frozen top-left corner — sticky both axes */}
      <div
        className="shrink-0 flex items-center px-3 border-r border-b"
        style={{
          width: FROZEN_WIDTH,
          backgroundColor: colors.cardBg,
          borderColor: colors.border,
          position: 'sticky',
          left: 0,
          zIndex: 30,
        }}
      >
        <span className="text-xs font-medium" style={{ color: colors.textFaint }}>Platform / Account</span>
      </div>

      {/* Date cells */}
      {dates.map((date) => {
        const key = formatDate(date);
        const isToday = key === today;
        const isPast = key < today;
        const isLaunchDay = (launchDays || []).includes(key);
        const { day, date: dateNum, month } = formatDisplayDate(date);

        return (
          <div
            key={key}
            className="shrink-0 flex flex-col items-center justify-center py-2 border-r border-b relative group"
            style={{
              width: columnWidth,
              backgroundColor: isLaunchDay
                ? 'rgba(139, 92, 246, 0.2)'
                : isToday
                ? 'rgba(59,130,246,0.12)'
                : colors.cardBg,
              borderColor: colors.border,
              borderBottom: isLaunchDay
                ? '2px solid #8b5cf6'
                : isToday
                ? '2px solid #3b82f6'
                : undefined,
              position: 'relative',
            }}
          >
            <span
              className="text-[10px] uppercase tracking-wider font-medium"
              style={{
                color: isLaunchDay ? '#8b5cf6' : isToday ? '#3b82f6' : colors.textFaint,
                opacity: !isToday && !isLaunchDay && isPast ? 0.4 : 1,
              }}
            >
              {day}
            </span>
            <span
              className="text-lg font-semibold leading-tight"
              style={{
                color: isLaunchDay ? '#8b5cf6' : isToday ? '#3b82f6' : colors.text,
                fontFamily: 'JetBrains Mono, monospace',
                opacity: !isToday && !isLaunchDay && isPast ? 0.4 : 1,
              }}
            >
              {dateNum}
            </span>
            <span
              className="text-[10px]"
              style={{
                color: isLaunchDay ? '#8b5cf6' : isToday ? '#3b82f6' : colors.textFaint,
                opacity: !isToday && !isLaunchDay && isPast ? 0.4 : 1,
              }}
            >
              {month}
            </span>

            {/* Launch badge */}
            {isLaunchDay && (
              <span
                className="text-[8px] font-bold uppercase tracking-widest mt-0.5"
                style={{ color: '#8b5cf6', letterSpacing: '0.1em' }}
              >
                Launch
              </span>
            )}

            {/* Launch day toggle flag button */}
            <button
              onClick={(e) => { e.stopPropagation(); onToggleLaunchDay(key); }}
              title={isLaunchDay ? 'Remove launch day' : 'Mark as launch day'}
              className={isLaunchDay ? '' : 'opacity-0 group-hover:opacity-100'}
              style={{
                position: 'absolute',
                top: 4,
                right: 6,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                color: isLaunchDay ? '#8b5cf6' : 'rgba(139,92,246,0.5)',
                transition: 'opacity 0.15s',
                lineHeight: 1,
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill={isLaunchDay ? '#8b5cf6' : 'none'} stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                <line x1="4" y1="22" x2="4" y2="15"/>
              </svg>
            </button>

            {/* Column resize handle — right edge */}
            <div
              onPointerDown={onColumnResizeStart}
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 6,
                height: '100%',
                cursor: 'col-resize',
                zIndex: 2,
              }}
              title="Drag to resize column"
            >
              {/* Visual indicator strip */}
              <div
                style={{
                  position: 'absolute',
                  right: 1,
                  top: '20%',
                  bottom: '20%',
                  width: 2,
                  borderRadius: 1,
                  backgroundColor: 'transparent',
                  transition: 'background-color 0.15s',
                }}
                className="resize-handle-inner"
              />
            </div>
          </div>
        );
      })}

      <style>{`
        .shrink-0:hover .resize-handle-inner {
          background-color: rgba(255,255,255,0.15) !important;
        }
        [style*="col-resize"]:hover + .resize-handle-inner,
        [style*="col-resize"]:active .resize-handle-inner {
          background-color: #3b82f6 !important;
        }
      `}</style>
    </div>
  );
}
