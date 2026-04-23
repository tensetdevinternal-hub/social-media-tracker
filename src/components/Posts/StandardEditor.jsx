import CharCounter from './CharCounter';

export default function StandardEditor({ content, mediaLink, onChange, charLimit, platformName, colors }) {
  const inputStyle = {
    backgroundColor: colors.inputBg,
    border: `1px solid ${colors.inputBorder}`,
    color: colors.text,
  };

  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs" style={{ color: colors.textMuted }}>
            Caption
          </label>
          <CharCounter current={content.length} max={charLimit} />
        </div>
        <textarea
          value={content}
          onChange={(e) => onChange({ content: e.target.value, mediaLink })}
          placeholder={`Write your ${platformName} post...`}
          rows={8}
          className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
          style={inputStyle}
        />
      </div>
      <div>
        <label className="block text-xs mb-1" style={{ color: colors.textMuted }}>
          Media Link
        </label>
        <input
          type="url"
          value={mediaLink}
          onChange={(e) => onChange({ content, mediaLink: e.target.value })}
          placeholder="Link to image/video (Drive, Dropbox, etc.)"
          className="w-full px-3 py-1.5 rounded-lg text-xs outline-none"
          style={inputStyle}
        />
      </div>
    </div>
  );
}
