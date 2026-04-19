export default function CharCounter({ current, max }) {
  const remaining = max - current;
  const isOver = remaining < 0;
  const isWarning = remaining >= 0 && remaining <= 20;

  const color = isOver ? '#ef4444' : isWarning ? '#f59e0b' : '#6b7280';

  return (
    <span className="text-[10px] tabular-nums" style={{ color }}>
      {isOver ? `−${Math.abs(remaining)}` : remaining}
    </span>
  );
}
