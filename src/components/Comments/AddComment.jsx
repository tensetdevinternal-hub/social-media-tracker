import { useState } from 'react';

const USERNAME_KEY = 'contentCalendarUsername';

export default function AddComment({ onAdd, colors }) {
  const [text, setText] = useState('');
  const [author, setAuthor] = useState(() => localStorage.getItem(USERNAME_KEY) || '');
  const [editingAuthor, setEditingAuthor] = useState(!localStorage.getItem(USERNAME_KEY));

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedText = text.trim();
    const trimmedAuthor = author.trim();
    if (!trimmedText || !trimmedAuthor) return;
    localStorage.setItem(USERNAME_KEY, trimmedAuthor);
    onAdd({ author: trimmedAuthor, text: trimmedText });
    setText('');
    setEditingAuthor(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {editingAuthor && (
        <input
          type="text"
          placeholder="Your name"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="w-full px-3 py-1.5 rounded-lg text-xs outline-none"
          style={{
            backgroundColor: colors.inputBg,
            border: `1px solid ${colors.inputBorder}`,
            color: colors.text,
          }}
        />
      )}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder={author ? `Comment as ${author}...` : 'Enter your name first...'}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => { if (!author) setEditingAuthor(true); }}
          className="flex-1 px-3 py-1.5 rounded-lg text-xs outline-none"
          style={{
            backgroundColor: colors.inputBg,
            border: `1px solid ${colors.inputBorder}`,
            color: colors.text,
          }}
        />
        {author && !editingAuthor && (
          <button
            type="button"
            onClick={() => setEditingAuthor(true)}
            className="text-xs px-1"
            style={{ color: colors.textFaint }}
            title="Change name"
          >
            ✏️
          </button>
        )}
        <button
          type="submit"
          disabled={!text.trim() || !author.trim()}
          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-80 disabled:opacity-40"
          style={{ backgroundColor: '#1e3a5a', color: '#3b82f6' }}
        >
          Post
        </button>
      </div>
    </form>
  );
}
