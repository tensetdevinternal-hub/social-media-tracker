/**
 * TwitterPreview — renders tweet(s) as they would appear on X (dark theme).
 * Shows a thread connector when there are multiple tweets.
 */

const X_ICON = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-label="X">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.912-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

function TweetCard({ tweet, index, total, accountName }) {
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const handle = accountName
    ? accountName.replace(/^@/, '')
    : 'username';
  const displayName = handle.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex gap-3 px-4 py-3">
      {/* Left: avatar + thread line */}
      <div className="flex flex-col items-center shrink-0">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
          style={{ backgroundColor: '#1da1f2', color: '#fff' }}
        >
          {initials}
        </div>
        {!isLast && (
          <div
            className="w-0.5 flex-1 mt-1"
            style={{ backgroundColor: '#2f3336', minHeight: 16 }}
          />
        )}
      </div>

      {/* Right: content */}
      <div className="flex-1 min-w-0 pb-1">
        {/* Name row */}
        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
          <span className="text-sm font-bold" style={{ color: '#e7e9ea' }}>
            {displayName}
          </span>
          {/* Verified badge */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#1da1f2">
            <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91-1.01-1.01-2.52-1.27-3.91-.81C14.67 2.88 13.43 2 12 2c-1.43 0-2.67.88-3.34 2.19-1.39-.46-2.9-.2-3.91.81-1.01 1.01-1.27 2.52-.81 3.91C2.88 9.33 2 10.57 2 12c0 1.43.88 2.67 2.19 3.34-.46 1.39-.2 2.9.81 3.91 1.01 1.01 2.52 1.27 3.91.81C9.33 21.12 10.57 22 12 22c1.43 0 2.67-.88 3.34-2.19 1.39.46 2.9.2 3.91-.81 1.01-1.01 1.27-2.52.81-3.91C21.12 14.67 22 13.43 22 12zm-6.16-1.84l-4.3 5.74a.75.75 0 01-1.09.13l-2.45-2.45a.75.75 0 011.06-1.06l1.85 1.85 3.75-5.01a.75.75 0 011.18.93z" />
          </svg>
          <span className="text-sm" style={{ color: '#71767b' }}>
            @{handle}
          </span>
          <span style={{ color: '#71767b' }}>·</span>
          <span className="text-sm" style={{ color: '#71767b' }}>now</span>
        </div>

        {/* Tweet text */}
        {tweet.text ? (
          <p
            className="text-sm leading-relaxed whitespace-pre-wrap break-words"
            style={{ color: '#e7e9ea' }}
          >
            {tweet.text}
          </p>
        ) : (
          <p className="text-sm italic" style={{ color: '#71767b' }}>
            (empty tweet)
          </p>
        )}

        {/* Media link badge */}
        {tweet.mediaLink && (
          <div
            className="mt-2 rounded-xl overflow-hidden flex items-center gap-2 px-3 py-2.5"
            style={{ backgroundColor: '#16181c', border: '1px solid #2f3336' }}
          >
            <span className="text-lg">🖼️</span>
            <div className="min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: '#e7e9ea' }}>
                Media attached
              </p>
              <p className="text-[10px] truncate" style={{ color: '#71767b' }}>
                {tweet.mediaLink}
              </p>
            </div>
          </div>
        )}

        {/* Engagement row */}
        <div className="flex items-center gap-5 mt-2.5">
          {[
            { icon: '💬', count: '' },
            { icon: '🔁', count: '' },
            { icon: '❤️', count: '' },
            { icon: '📊', count: '' },
            { icon: '↑', count: '' },
          ].map(({ icon, count }, i) => (
            <button
              key={i}
              className="flex items-center gap-1 text-xs transition-opacity hover:opacity-70"
              style={{ color: '#71767b' }}
            >
              <span>{icon}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TwitterPreview({ tweets, accountName, onClose }) {
  const validTweets = tweets?.length ? tweets : [{ text: '', mediaLink: '' }];

  return (
    /* Full-screen overlay */
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[598px] mx-4 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        style={{ backgroundColor: '#000', border: '1px solid #2f3336', maxHeight: '85vh' }}
      >
        {/* X-style top bar */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: '#2f3336' }}
        >
          <div style={{ color: '#e7e9ea' }}>{X_ICON}</div>
          <span className="text-sm font-bold" style={{ color: '#e7e9ea' }}>
            Post preview
          </span>
          <button
            onClick={onClose}
            className="text-lg leading-none hover:opacity-70 transition-opacity"
            style={{ color: '#71767b' }}
          >
            ×
          </button>
        </div>

        {/* Tweets */}
        <div className="overflow-y-auto">
          {validTweets.map((tweet, i) => (
            <div key={i}>
              <TweetCard
                tweet={tweet}
                index={i}
                total={validTweets.length}
                accountName={accountName}
              />
              {i < validTweets.length - 1 && (
                <div style={{ height: 1, backgroundColor: '#2f3336', marginLeft: 60 }} />
              )}
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <div
          className="px-4 py-2.5 border-t text-center"
          style={{ borderColor: '#2f3336' }}
        >
          <p className="text-[11px]" style={{ color: '#71767b' }}>
            Draft preview — not yet posted
          </p>
        </div>
      </div>
    </div>
  );
}
