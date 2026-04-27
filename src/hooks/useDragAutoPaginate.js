import { useRef } from 'react';
import { useDndMonitor } from '@dnd-kit/core';

const EDGE_PX = 60;
const HOVER_MS = 600;

export function useDragAutoPaginate({ containerRef, onPaginatePrev, onPaginateNext }) {
  const edgeTimerRef = useRef(null);
  const edgeSideRef = useRef(null);
  const pointerHandlerRef = useRef(null);

  const clearEdge = () => {
    if (edgeTimerRef.current) {
      clearTimeout(edgeTimerRef.current);
      edgeTimerRef.current = null;
    }
    edgeSideRef.current = null;
  };

  const scheduleSide = (side) => {
    if (edgeSideRef.current === side && edgeTimerRef.current) return;
    if (edgeTimerRef.current) clearTimeout(edgeTimerRef.current);
    edgeSideRef.current = side;
    const tick = () => {
      if (edgeSideRef.current !== side) return;
      if (side === 'left') onPaginatePrev();
      else onPaginateNext();
      // re-arm so user can keep paginating by holding at the edge
      edgeTimerRef.current = setTimeout(tick, HOVER_MS);
    };
    edgeTimerRef.current = setTimeout(tick, HOVER_MS);
  };

  const handlePointerMove = (e) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const { clientX, clientY } = e;
    // Only react if pointer is vertically inside the container — avoids
    // firing when the pointer leaves the grid (e.g. over the scrollbar/outside).
    if (clientY < rect.top || clientY > rect.bottom) {
      clearEdge();
      return;
    }
    if (clientX >= rect.left && clientX < rect.left + EDGE_PX) {
      scheduleSide('left');
    } else if (clientX <= rect.right && clientX > rect.right - EDGE_PX) {
      scheduleSide('right');
    } else {
      clearEdge();
    }
  };

  const attachPointerListener = () => {
    if (pointerHandlerRef.current) return;
    pointerHandlerRef.current = handlePointerMove;
    window.addEventListener('pointermove', pointerHandlerRef.current);
  };

  const detachPointerListener = () => {
    if (pointerHandlerRef.current) {
      window.removeEventListener('pointermove', pointerHandlerRef.current);
      pointerHandlerRef.current = null;
    }
    clearEdge();
  };

  useDndMonitor({
    onDragStart: () => {
      attachPointerListener();
    },
    onDragEnd: () => {
      detachPointerListener();
    },
    onDragCancel: () => {
      detachPointerListener();
    },
  });
}
