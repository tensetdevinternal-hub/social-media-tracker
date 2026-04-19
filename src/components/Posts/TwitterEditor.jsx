import CharCounter from './CharCounter';

export default function TwitterEditor({ tweets, onChange, charLimit, colors }) {
  const handleTweetText = (index, value) => {
    const updated = tweets.map((t, i) => i === index ? { ...t, text: value } : t);
    onChange(updated);
  };

  const handleMediaLink = (index, value) => {
    const updated = tweets.map((t, i) => i === index ? { ...t, mediaLink: value } : t);
    onChange(updated);
  };

  const addTweet = () => {
    onChange([...tweets, { text: '', mediaLink: '' }]);
  };

  const removeTweet = (index) => {
    if (tweets.length <= 1) return;
    onChange(tweets.filter((_, i) => i !== index));
  };

  const inputStyle = {
    backgroundColor: colors.inputBg,
    border: `1px solid ${colors.inputBorder}`,
    color: colors.text,
  };

  return (
    <div className="space-y-3">
      {tweets.map((tweet, index) => (
        <div
          key={index}
          className="rounded-lg p-3 space-y-2"
          style={{ backgroundColor: 'rgba(29,161,242,0.07)', border: '1px solid rgba(29,161,242,0.2)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium" style={{ color: '#1da1f2' }}>
              Tweet {index + 1}{tweets.length > 1 ? ` of ${tweets.length}` : ''}
            </span>
            <div className="flex items-center gap-2">
              <CharCounter current={tweet.text.length} max={charLimit} />
              {tweets.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTweet(index)}
                  className="text-[10px] px-1.5 py-0.5 rounded hover:opacity-80 transition-colors"
                  style={{ backgroundColor: '#450a0a', color: '#ef4444' }}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
          <textarea
            value={tweet.text}
            onChange={(e) => handleTweetText(index, e.target.value)}
            placeholder={index === 0 ? "What's happening?" : 'Continue the thread...'}
            rows={3}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
            style={inputStyle}
          />
          <input
            type="url"
            value={tweet.mediaLink}
            onChange={(e) => handleMediaLink(index, e.target.value)}
            placeholder="Media link (Drive, Dropbox, etc.)"
            className="w-full px-3 py-1.5 rounded-lg text-xs outline-none"
            style={inputStyle}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={addTweet}
        className="w-full py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-80"
        style={{ backgroundColor: 'rgba(29,161,242,0.1)', color: '#1da1f2', border: '1px dashed rgba(29,161,242,0.3)' }}
      >
        + Add Tweet
      </button>
    </div>
  );
}
