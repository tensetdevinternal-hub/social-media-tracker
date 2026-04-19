import { useState } from 'react';

export default function AddAccountModal({ platforms, onSave, onClose, colors }) {
  const [platformId, setPlatformId] = useState(platforms[0]?.id || '');
  const [accountName, setAccountName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = accountName.trim();
    if (!trimmed || !platformId) return;
    onSave({ platformId, accountName: trimmed });
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
          Add Account
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs mb-1" style={{ color: colors.textMuted }}>Platform</label>
            <select
              value={platformId}
              onChange={(e) => setPlatformId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={inputStyle}
            >
              {platforms.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: colors.textMuted }}>Account Name</label>
            <input
              type="text"
              placeholder="e.g. @secondary_account"
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
              disabled={!accountName.trim() || !platformId}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-80 disabled:opacity-40"
              style={{ backgroundColor: '#1e3a5a', color: '#3b82f6' }}
            >
              Add Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
