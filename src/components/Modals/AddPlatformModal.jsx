import { useState } from 'react';
import { PLATFORM_NAMES } from '../../constants/platforms';

export default function AddPlatformModal({ onSave, onClose, colors }) {
  const [platformName, setPlatformName] = useState(PLATFORM_NAMES[0]);
  const [accountName, setAccountName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = accountName.trim();
    if (!trimmed) return;
    onSave({ platformName, accountName: trimmed });
  };

  const overlayStyle = {
    position: 'fixed', inset: 0, zIndex: 50,
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  };

  const inputStyle = {
    backgroundColor: colors.inputBg,
    border: `1px solid ${colors.inputBorder}`,
    color: colors.text,
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-xl p-6 shadow-2xl"
        style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}
      >
        <h2 className="text-base font-semibold mb-4" style={{ color: colors.text }}>
          Add Platform
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs mb-1" style={{ color: colors.textMuted }}>Platform</label>
            <select
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={inputStyle}
            >
              {PLATFORM_NAMES.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: colors.textMuted }}>First Account Name</label>
            <input
              type="text"
              placeholder="e.g. @main_account"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              autoFocus
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={inputStyle}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm transition-colors hover:opacity-80"
              style={{ backgroundColor: colors.buttonBg, color: colors.textMuted }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!accountName.trim()}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-80 disabled:opacity-40"
              style={{ backgroundColor: '#1e3a5a', color: '#3b82f6' }}
            >
              Add Platform
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
