import { useState } from 'react';

export function useCalendarNavigation() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const goToPrev = (weekSpan = 1) => {
    setCurrentDate((d) => {
      const next = new Date(d);
      next.setDate(next.getDate() - 7 * weekSpan);
      return next;
    });
  };

  const goToNext = (weekSpan = 1) => {
    setCurrentDate((d) => {
      const next = new Date(d);
      next.setDate(next.getDate() + 7 * weekSpan);
      return next;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return { currentDate, setCurrentDate, goToPrev, goToNext, goToToday };
}
