import { STATUSES } from '../../constants/statuses';

export default function StatusBadge({ status, size = 'sm' }) {
  const cfg = STATUSES[status] || STATUSES.not_started;
  const dotSize = size === 'sm' ? 'w-2 h-2' : 'w-3 h-3';
  return (
    <span
      className={`inline-block rounded-full ${dotSize}`}
      style={{ backgroundColor: cfg.color }}
      title={cfg.label}
    />
  );
}
