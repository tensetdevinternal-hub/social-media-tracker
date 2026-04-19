export default function SegmentedControl({ options, value, onChange, colors }) {
  return (
    <div
      className="flex rounded-lg p-0.5 gap-0.5"
      style={{ backgroundColor: colors.buttonBg }}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className="px-3 py-1 rounded-md text-xs font-medium transition-colors"
          style={{
            backgroundColor: value === opt.value ? colors.cardBg : 'transparent',
            color: value === opt.value ? colors.text : colors.textMuted,
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
