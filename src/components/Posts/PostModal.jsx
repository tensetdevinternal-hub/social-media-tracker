import { useState } from 'react';
import { STATUSES, STATUS_KEYS } from '../../constants/statuses';
import { PLATFORMS } from '../../constants/platforms';
import { formatDate } from '../../utils/dateUtils';
import { generateId } from '../../utils/idGenerator';
import TwitterEditor from './TwitterEditor';
import StandardEditor from './StandardEditor';
import TwitterPreview from './TwitterPreview';

export default function PostModal({ post, platformName, allAccounts, onSave, onDelete, onDuplicate, onClose, colors }) {
  const platformConfig = PLATFORMS[platformName] || {};
  const isTwitter = platformConfig.type === 'twitter';

  const [title, setTitle] = useState(post.title || '');
  const [notes, setNotes] = useState(post.notes || '');
  const [captionStatus, setCaptionStatus] = useState(post.captionStatus || 'not_started');
  const [mediaStatus, setMediaStatus] = useState(post.mediaStatus || 'not_started');
  const [tweets, setTweets] = useState(post.tweets || [{ text: '', mediaLink: '' }]);
  const [content, setContent] = useState(post.content || '');
  const [mediaLink, setMediaLink] = useState(post.mediaLink || '');
  const [xPostLink, setXPostLink] = useState(post.xPostLink || '');
  const [titleError, setTitleError] = useState(false);

  // Preview state
  const [showPreview, setShowPreview] = useState(false);

  // Duplicate panel state
  const [showDuplicatePanel, setShowDuplicatePanel] = useState(false);
  const [dupDate, setDupDate] = useState(formatDate(new Date()));
  const [dupAccountId, setDupAccountId] = useState('');

  const handleSave = () => {
    if (!title.trim()) {
      setTitleError(true);
      return;
    }
    const updatedPost = {
      ...post,
      title: title.trim(),
      notes,
      captionStatus,
      mediaStatus,
      ...(isTwitter ? { tweets, xPostLink } : { content, mediaLink }),
    };
    onSave(updatedPost);
  };

  const handleDuplicateConfirm = () => {
    if (!dupDate || !dupAccountId) return;
    const copy = {
      id: generateId(),
      title: title.trim() || post.title,
      notes,
      captionStatus: 'not_started',
      mediaStatus: 'not_started',
      comments: [],
      ...(isTwitter
        ? { tweets: tweets.map((t) => ({ ...t })) }
        : { content, mediaLink }),
    };
    onDuplicate(copy, dupAccountId, dupDate);
    setShowDuplicatePanel(false);
  };

  const inputStyle = {
    backgroundColor: colors.inputBg,
    border: `1px solid ${colors.inputBorder}`,
    color: colors.text,
  };

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer',
  };

  const overlayStyle = {
    position: 'fixed', inset: 0, zIndex: 50,
    backgroundColor: 'rgba(0,0,0,0.75)',
    display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
    paddingTop: '5vh', paddingBottom: '5vh',
    overflowY: 'auto',
  };

  return (
    <>
    <div style={overlayStyle} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-xl shadow-2xl mx-4 flex flex-col"
        style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: colors.borderLight }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{platformConfig.icon || '📄'}</span>
            <div>
              <span className="text-xs font-medium" style={{ color: colors.textMuted }}>{platformName}</span>
              <p className="text-xs" style={{ color: colors.textFaint }}>
                {isTwitter ? 'Thread Editor' : 'Post Editor'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isTwitter && (
              <button
                onClick={() => setShowPreview(true)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors hover:opacity-80"
                style={{ backgroundColor: '#1da1f2', color: '#fff' }}
                title="Preview as X post"
              >
                <span>𝕏</span> Preview
              </button>
            )}
            <button
              onClick={onClose}
              className="text-lg leading-none hover:opacity-70 transition-opacity"
              style={{ color: colors.textFaint }}
            >
              ×
            </button>
          </div>
        </div>

        <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
          {/* Title */}
          <div>
            <label className="block text-xs mb-1 font-medium" style={{ color: colors.textMuted }}>
              Title <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setTitleError(false); }}
              placeholder="Post title (required)"
              autoFocus
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{
                ...inputStyle,
                border: `1px solid ${titleError ? '#ef4444' : colors.inputBorder}`,
              }}
            />
            {titleError && (
              <p className="text-[10px] mt-1" style={{ color: '#ef4444' }}>Title is required</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs mb-1 font-medium" style={{ color: colors.textMuted }}>
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal notes (not published)"
              rows={4}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
              style={inputStyle}
            />
          </div>

          {/* X Post Link */}
          {isTwitter && (
            <div>
              <label className="block text-xs mb-1 font-medium" style={{ color: colors.textMuted }}>
                𝕏 Post Link
              </label>
              <input
                type="url"
                value={xPostLink}
                onChange={(e) => setXPostLink(e.target.value)}
                placeholder="https://x.com/..."
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={inputStyle}
              />
            </div>
          )}

          {/* Editor */}
          {isTwitter ? (
            <TwitterEditor
              tweets={tweets}
              onChange={setTweets}
              charLimit={platformConfig.charLimit}
              colors={colors}
            />
          ) : (
            <StandardEditor
              content={content}
              mediaLink={mediaLink}
              onChange={({ content: c, mediaLink: m }) => { setContent(c); setMediaLink(m); }}
              charLimit={platformConfig.charLimit}
              platformName={platformName}
              colors={colors}
            />
          )}

          {/* Status selectors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: colors.textMuted }}>Caption Status</label>
              <select
                value={captionStatus}
                onChange={(e) => setCaptionStatus(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg text-xs outline-none"
                style={{
                  ...selectStyle,
                  color: STATUSES[captionStatus]?.color || colors.text,
                }}
              >
                {STATUS_KEYS.map((key) => (
                  <option key={key} value={key}>{STATUSES[key].label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: colors.textMuted }}>Media Status</label>
              <select
                value={mediaStatus}
                onChange={(e) => setMediaStatus(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg text-xs outline-none"
                style={{
                  ...selectStyle,
                  color: STATUSES[mediaStatus]?.color || colors.text,
                }}
              >
                {STATUS_KEYS.map((key) => (
                  <option key={key} value={key}>{STATUSES[key].label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Media links summary for Twitter */}
          {isTwitter && tweets.some((t) => t.mediaLink) && (
            <div
              className="rounded-lg px-3 py-2"
              style={{ backgroundColor: colors.inputBg, border: `1px solid ${colors.borderLight}` }}
            >
              <p className="text-[10px] font-medium mb-1" style={{ color: colors.textFaint }}>Media Links</p>
              {tweets.map((t, i) =>
                t.mediaLink ? (
                  <a
                    key={i}
                    href={t.mediaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-[10px] truncate hover:underline"
                    style={{ color: '#3b82f6' }}
                  >
                    Tweet {i + 1}: {t.mediaLink}
                  </a>
                ) : null
              )}
            </div>
          )}

          {/* Duplicate panel */}
          {showDuplicatePanel && (
            <DuplicatePanel
              dupDate={dupDate}
              dupAccountId={dupAccountId}
              allAccounts={allAccounts || []}
              onDateChange={setDupDate}
              onAccountChange={setDupAccountId}
              onConfirm={handleDuplicateConfirm}
              onCancel={() => setShowDuplicatePanel(false)}
              colors={colors}
            />
          )}

        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-6 py-4 border-t"
          style={{ borderColor: colors.borderLight }}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => { if (window.confirm('Delete this post?')) onDelete(post.id); }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-80"
              style={{ backgroundColor: '#450a0a', color: '#ef4444' }}
            >
              Delete
            </button>
            <button
              onClick={() => setShowDuplicatePanel(!showDuplicatePanel)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-80"
              style={{ backgroundColor: colors.buttonBg, color: colors.textMuted }}
            >
              Duplicate
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs transition-colors hover:opacity-80"
              style={{ backgroundColor: colors.buttonBg, color: colors.textMuted }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-80"
              style={{ backgroundColor: '#3b82f6', color: '#fff' }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Twitter preview overlay */}
    {showPreview && (
      <TwitterPreview
        tweets={tweets}
        accountName={allAccounts?.find((a) => a.platformName === platformName)?.name || ''}
        onClose={() => setShowPreview(false)}
      />
    )}
    </>
  );
}

function DuplicatePanel({ dupDate, dupAccountId, allAccounts, onDateChange, onAccountChange, onConfirm, onCancel, colors }) {
  return (
    <div
      className="rounded-lg p-3 space-y-2"
      style={{ backgroundColor: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.2)' }}
    >
      <p className="text-xs font-medium" style={{ color: '#3b82f6' }}>Duplicate to...</p>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] mb-0.5" style={{ color: colors.textMuted }}>Date</label>
          <input
            type="date"
            value={dupDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full px-2 py-1.5 rounded-lg text-xs outline-none"
            style={{
              backgroundColor: colors.inputBg,
              border: `1px solid ${colors.inputBorder}`,
              color: colors.text,
              colorScheme: 'dark',
            }}
          />
        </div>
        <div>
          <label className="block text-[10px] mb-0.5" style={{ color: colors.textMuted }}>Account</label>
          <select
            value={dupAccountId}
            onChange={(e) => onAccountChange(e.target.value)}
            className="w-full px-2 py-1.5 rounded-lg text-xs outline-none"
            style={{
              backgroundColor: colors.inputBg,
              border: `1px solid ${colors.inputBorder}`,
              color: colors.text,
              cursor: 'pointer',
            }}
          >
            <option value="">Select account...</option>
            {allAccounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.platformName} › {acc.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 rounded-lg text-xs hover:opacity-80"
          style={{ backgroundColor: colors.buttonBg, color: colors.textMuted }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={!dupDate || !dupAccountId}
          className="px-3 py-1 rounded-lg text-xs font-medium hover:opacity-80 disabled:opacity-40"
          style={{ backgroundColor: '#1e3a5a', color: '#3b82f6' }}
        >
          Duplicate
        </button>
      </div>
    </div>
  );
}
