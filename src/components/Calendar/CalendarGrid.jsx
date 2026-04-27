import { DndContext, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useState, useCallback, useRef, useEffect } from 'react';
import DateHeader from './DateHeader';
import PlatformRow from './PlatformRow';
import PostCard from '../Posts/PostCard';
import { useDragAutoPaginate } from '../../hooks/useDragAutoPaginate';

const MIN_COL_WIDTH = 80;
const DEFAULT_COL_WIDTH = 160;
const MIN_ROW_HEIGHT = 40;
const DEFAULT_ROW_HEIGHT = 90;

const ZOOM_STEPS = [0.4, 0.5, 0.6, 0.75, 1.0];

export default function CalendarGrid({
  platforms,
  dates,
  focusOffsetDays = 0,
  posts,
  filteredPostIds,
  hasFilter,
  collapsedPlatforms,
  viewMode,
  onToggleCollapse,
  onAddPost,
  onEditPost,
  onDragEnd,
  onDeletePlatform,
  onDeleteAccount,
  colors,
  launchDays,
  onToggleLaunchDay,
  onPaginatePrev,
  onPaginateNext,
}) {
  const [activePost, setActivePost] = useState(null);
  const [columnWidth, setColumnWidth] = useState(DEFAULT_COL_WIDTH);
  const [rowHeights, setRowHeights] = useState({});
  const [zoomIndex, setZoomIndex] = useState(ZOOM_STEPS.length - 1); // start at 100%
  const scrollContainerRef = useRef(null);
  const lastFirstDateRef = useRef(null);

  const zoom = ZOOM_STEPS[zoomIndex];
  const effectiveColWidth = Math.max(MIN_COL_WIDTH, Math.round(columnWidth * zoom));
  const effectiveDefaultRowHeight = Math.max(MIN_ROW_HEIGHT, Math.round(DEFAULT_ROW_HEIGHT * zoom));

  // Auto-scroll the focus week to the left edge (right after the sticky label)
  // when the date range changes — i.e. on mount and on prev/next/today.
  // Only fires when the first date actually changes, so user scrolling isn't fought.
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el || !dates || dates.length === 0) return;
    const firstKey = dates[0].toISOString();
    if (lastFirstDateRef.current === firstKey) return;
    lastFirstDateRef.current = firstKey;
    el.scrollLeft = focusOffsetDays * effectiveColWidth;
  }, [dates, focusOffsetDays, effectiveColWidth]);

  const zoomOut = () => setZoomIndex((i) => Math.max(0, i - 1));
  const zoomIn  = () => setZoomIndex((i) => Math.min(ZOOM_STEPS.length - 1, i + 1));
  const zoomReset = () => setZoomIndex(ZOOM_STEPS.length - 1);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  );

  // ─── Column resize ────────────────────────────────────────────────────────
  const handleColumnResizeStart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startWidth = columnWidth;
    const onMove = (e) => setColumnWidth(Math.max(MIN_COL_WIDTH, startWidth + (e.clientX - startX)));
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, [columnWidth]);

  // ─── Row resize ───────────────────────────────────────────────────────────
  const handleRowResizeStart = useCallback((e, accountId) => {
    e.preventDefault();
    e.stopPropagation();
    const startY = e.clientY;
    const startHeight = rowHeights[accountId] ?? DEFAULT_ROW_HEIGHT;
    const onMove = (e) => {
      setRowHeights((prev) => ({
        ...prev,
        [accountId]: Math.max(MIN_ROW_HEIGHT, startHeight + (e.clientY - startY)),
      }));
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, [rowHeights]);

  // ─── Drag & drop ──────────────────────────────────────────────────────────
  const handleDragStart = (event) => {
    const { postId, sourceCellKey } = event.active.data.current || {};
    if (!postId || !sourceCellKey) return;
    setActivePost((posts[sourceCellKey] || []).find((p) => p.id === postId) || null);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActivePost(null);
    if (!over || !active) return;
    const { postId, sourceCellKey } = active.data.current || {};
    if (!postId || !sourceCellKey) return;

    const overId = String(over.id);
    let targetCellKey, insertIndex;
    if (overId.includes('::')) {
      const sepIdx = overId.lastIndexOf('::');
      targetCellKey = overId.slice(0, sepIdx);
      insertIndex = parseInt(overId.slice(sepIdx + 2), 10);
    } else {
      targetCellKey = overId;
      insertIndex = null;
    }

    // Same cell with no slot = no movement
    if (sourceCellKey === targetCellKey && insertIndex === null) return;

    onDragEnd({ postId, sourceCellKey, targetCellKey, insertIndex });
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <DragAutoPaginate
        containerRef={scrollContainerRef}
        onPaginatePrev={onPaginatePrev}
        onPaginateNext={onPaginateNext}
      />
      <div ref={scrollContainerRef} className="relative overflow-auto flex-1" style={{ backgroundColor: colors.bg, fontSize: `${zoom * 100}%` }}>
        <div style={{ minWidth: 'max-content' }}>
          <DateHeader
            dates={dates}
            columnWidth={effectiveColWidth}
            onColumnResizeStart={handleColumnResizeStart}
            colors={colors}
            launchDays={launchDays}
            onToggleLaunchDay={onToggleLaunchDay}
          />

          {platforms.length === 0 && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <p className="text-4xl mb-3">📅</p>
                <p className="text-sm font-medium mb-1" style={{ color: colors.textMuted }}>No platforms yet</p>
                <p className="text-xs" style={{ color: colors.textFaint }}>Click "+ Platform" to get started</p>
              </div>
            </div>
          )}

          {/* Status legend — top of grid */}
          {platforms.length > 0 && (
            <div
              className="flex items-center gap-4 px-4 py-1.5 border-b"
              style={{
                borderColor: colors.borderLight,
                backgroundColor: colors.cardBg,
              }}
            >
              <span className="text-[10px] uppercase tracking-wider" style={{ color: colors.textFaint }}>Status</span>
              {[
                { color: '#6b7280', label: 'Not Started' },
                { color: '#f59e0b', label: 'Draft' },
                { color: '#3b82f6', label: 'Confirmed' },
                { color: '#10b981', label: 'Posted' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-[10px]" style={{ color: colors.textFaint }}>{label}</span>
                </div>
              ))}
              <span className="text-[10px] ml-1" style={{ color: colors.textFaint }}>Caption · Media</span>
            </div>
          )}

          {platforms.map((platform) => (
            <PlatformRow
              key={platform.id}
              platform={platform}
              dates={dates}
              posts={posts}
              filteredPostIds={filteredPostIds}
              hasFilter={hasFilter}
              collapsed={!!collapsedPlatforms[platform.id]}
              columnWidth={effectiveColWidth}
              rowHeights={rowHeights}
              defaultRowHeight={effectiveDefaultRowHeight}
              onToggleCollapse={onToggleCollapse}
              onAddPost={onAddPost}
              onEditPost={onEditPost}
              onDeletePlatform={onDeletePlatform}
              onDeleteAccount={onDeleteAccount}
              onRowResizeStart={handleRowResizeStart}
              viewMode={viewMode}
              colors={colors}
              launchDays={launchDays}
            />
          ))}

        </div>

        {/* Zoom controls — sticky bottom-right */}
        <div
          style={{
            position: 'sticky',
            bottom: 16,
            left: 'calc(100% - 140px)',
            width: 'fit-content',
            zIndex: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            backgroundColor: colors.cardBg,
            border: `1px solid ${colors.border}`,
            borderRadius: 8,
            padding: '3px 4px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          }}
        >
          <button
            onClick={zoomOut}
            disabled={zoomIndex === 0}
            title="Zoom out"
            style={{
              width: 26, height: 26,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 5,
              backgroundColor: 'transparent',
              color: zoomIndex === 0 ? colors.textFaint : colors.text,
              fontSize: 16,
              cursor: zoomIndex === 0 ? 'default' : 'pointer',
              border: 'none',
              opacity: zoomIndex === 0 ? 0.3 : 1,
            }}
          >
            −
          </button>
          <button
            onClick={zoomReset}
            title="Reset zoom"
            style={{
              minWidth: 38, height: 26, padding: '0 4px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 5,
              backgroundColor: zoom < 1 ? 'rgba(59,130,246,0.15)' : 'transparent',
              color: zoom < 1 ? '#3b82f6' : colors.textMuted,
              fontSize: 11,
              fontFamily: 'JetBrains Mono, monospace',
              cursor: 'pointer',
              border: 'none',
              fontWeight: 600,
            }}
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={zoomIn}
            disabled={zoomIndex === ZOOM_STEPS.length - 1}
            title="Zoom in"
            style={{
              width: 26, height: 26,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 5,
              backgroundColor: 'transparent',
              color: zoomIndex === ZOOM_STEPS.length - 1 ? colors.textFaint : colors.text,
              fontSize: 16,
              cursor: zoomIndex === ZOOM_STEPS.length - 1 ? 'default' : 'pointer',
              border: 'none',
              opacity: zoomIndex === ZOOM_STEPS.length - 1 ? 0.3 : 1,
            }}
          >
            +
          </button>
        </div>
      </div>

      <DragOverlay>
        {activePost && (
          <div
            className="rounded-lg p-2 shadow-2xl rotate-2"
            style={{ backgroundColor: colors.cellBg, border: `1px solid ${colors.border}`, width: effectiveColWidth - 10, opacity: 0.9 }}
          >
            <p className="text-xs font-medium" style={{ color: colors.text }}>{activePost.title}</p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

function DragAutoPaginate({ containerRef, onPaginatePrev, onPaginateNext }) {
  useDragAutoPaginate({ containerRef, onPaginatePrev, onPaginateNext });
  return null;
}
