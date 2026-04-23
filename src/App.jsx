import { useState, useMemo } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useCalendarNavigation } from './hooks/useCalendarNavigation';
import { getWeekDates, formatDate } from './utils/dateUtils';
import { generateId } from './utils/idGenerator';
import { PLATFORMS } from './constants/platforms';
import CalendarGrid from './components/Calendar/CalendarGrid';
import Navigation from './components/UI/Navigation';
import FilterBar from './components/UI/FilterBar';
import PostModal from './components/Posts/PostModal';
import AddPlatformModal from './components/Modals/AddPlatformModal';
import AddAccountModal from './components/Modals/AddAccountModal';

// ─── Dark theme colors ────────────────────────────────────────────────────────
const COLORS = {
  bg: '#0f0f1a',
  cardBg: '#16162a',
  cellBg: 'rgba(255,255,255,0.05)',
  border: '#4b5563',
  borderLight: '#374151',
  text: '#ffffff',
  textMuted: '#9ca3af',
  textFaint: '#6b7280',
  buttonBg: '#374151',
  inputBg: 'rgba(0,0,0,0.3)',
  inputBorder: '#374151',
};

// ─── Default data ─────────────────────────────────────────────────────────────
const DEFAULT_DATA = {
  platforms: [],
  posts: {},
};

// ─── Root component ───────────────────────────────────────────────────────────
export default function App() {
  // Persistent data
  const [data, setData] = useLocalStorage('contentCalendarDataV2', DEFAULT_DATA);

  // Calendar navigation
  const { currentDate, goToPrev, goToNext, goToToday } = useCalendarNavigation();

  // UI state
  const [viewMode, setViewMode] = useState('title');
  const [weekSpan, setWeekSpan] = useState(2);
  const [collapsedPlatforms, setCollapsedPlatforms] = useState({});

  // Modal state
  const [editingPost, setEditingPost] = useState(null);    // { post, cellKey, platformName }
  const [showAddModal, setShowAddModal] = useState(null);  // 'platform' | 'account' | null

  // Filter state
  const [filterText, setFilterText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPlatform, setFilterPlatform] = useState('all');

  // Computed week dates
  const weekDates = useMemo(() => getWeekDates(currentDate, weekSpan), [currentDate, weekSpan]);

  // ─── Derived: flat list of all accounts with platform info ─────────────────
  const allAccounts = useMemo(() => {
    return data.platforms.flatMap((p) =>
      p.accounts.map((a) => ({ ...a, platformName: p.name, platformId: p.id }))
    );
  }, [data.platforms]);

  // ─── Filter logic ──────────────────────────────────────────────────────────
  const filteredPostIds = useMemo(() => {
    const hasFilter = filterText || filterStatus !== 'all' || filterPlatform !== 'all';
    if (!hasFilter) return null;

    const matchingIds = new Set();
    const query = filterText.toLowerCase();

    // Build a map: accountId → platformName
    const accountPlatformMap = {};
    data.platforms.forEach((p) => {
      p.accounts.forEach((a) => { accountPlatformMap[a.id] = p.name; });
    });

    Object.entries(data.posts).forEach(([cellKey, postsArr]) => {
      // Extract accountId from cellKey: "accountId-YYYY-MM-DD"
      // The accountId may contain hyphens itself, but the date part is always YYYY-MM-DD (last 10 chars)
      const accountId = cellKey.slice(0, -(11)); // remove -YYYY-MM-DD (11 chars)
      const platformName = accountPlatformMap[accountId];

      postsArr.forEach((post) => {
        // Platform filter
        if (filterPlatform !== 'all' && platformName !== filterPlatform) return;

        // Status filter (matches either captionStatus or mediaStatus)
        if (filterStatus !== 'all') {
          const statusMatch =
            post.captionStatus === filterStatus || post.mediaStatus === filterStatus;
          if (!statusMatch) return;
        }

        // Text filter
        if (query) {
          const titleMatch = post.title?.toLowerCase().includes(query);
          const contentMatch = post.content?.toLowerCase().includes(query);
          const tweetMatch = post.tweets?.some((t) => t.text?.toLowerCase().includes(query));
          if (!titleMatch && !contentMatch && !tweetMatch) return;
        }

        matchingIds.add(post.id);
      });
    });

    return matchingIds;
  }, [data.posts, data.platforms, filterText, filterStatus, filterPlatform]);

  const hasFilter = !!(filterText || filterStatus !== 'all' || filterPlatform !== 'all');

  // Count hidden posts
  const hiddenCount = useMemo(() => {
    if (!filteredPostIds) return 0;
    let total = 0;
    let shown = 0;
    Object.values(data.posts).forEach((arr) => {
      total += arr.length;
      arr.forEach((p) => { if (filteredPostIds.has(p.id)) shown++; });
    });
    return total - shown;
  }, [data.posts, filteredPostIds]);

  // ─── Post handlers ─────────────────────────────────────────────────────────
  const handleAddPost = (cellKey) => {
    // Find the platform for this cell
    const accountId = cellKey.slice(0, -(11));
    const platform = data.platforms.find((p) =>
      p.accounts.some((a) => a.id === accountId)
    );
    if (!platform) return;
    const platformConfig = PLATFORMS[platform.name] || {};

    const newPost = {
      id: generateId(),
      title: '',
      captionStatus: 'not_started',
      mediaStatus: 'not_started',
      comments: [],
      ...(platformConfig.type === 'twitter'
        ? { tweets: [{ text: '', mediaLink: '' }] }
        : { content: '', mediaLink: '' }),
    };

    setEditingPost({ post: newPost, cellKey, platformName: platform.name, isNew: true });
  };

  const handleEditPost = (post, cellKey) => {
    const accountId = cellKey.slice(0, -(11));
    const platform = data.platforms.find((p) =>
      p.accounts.some((a) => a.id === accountId)
    );
    setEditingPost({ post, cellKey, platformName: platform?.name || '', isNew: false });
  };

  const handleSavePost = (updatedPost) => {
    if (!editingPost) return;
    const { cellKey, isNew } = editingPost;

    setData((prev) => {
      const cellPosts = prev.posts[cellKey] || [];
      let newCellPosts;
      if (isNew) {
        newCellPosts = [...cellPosts, updatedPost];
      } else {
        newCellPosts = cellPosts.map((p) => p.id === updatedPost.id ? updatedPost : p);
      }
      return {
        ...prev,
        posts: { ...prev.posts, [cellKey]: newCellPosts },
      };
    });
    setEditingPost(null);
  };

  const handleDeletePost = (postId) => {
    if (!editingPost) return;
    const { cellKey } = editingPost;

    setData((prev) => {
      const newCellPosts = (prev.posts[cellKey] || []).filter((p) => p.id !== postId);
      const newPosts = { ...prev.posts };
      if (newCellPosts.length === 0) {
        delete newPosts[cellKey];
      } else {
        newPosts[cellKey] = newCellPosts;
      }
      return { ...prev, posts: newPosts };
    });
    setEditingPost(null);
  };

  const handleDuplicatePost = (copyPost, targetAccountId, targetDate) => {
    const cellKey = `${targetAccountId}-${targetDate}`;
    setData((prev) => ({
      ...prev,
      posts: {
        ...prev.posts,
        [cellKey]: [...(prev.posts[cellKey] || []), copyPost],
      },
    }));
  };

  // ─── Drag & drop handler ───────────────────────────────────────────────────
  const handleDragEnd = ({ postId, sourceCellKey, targetCellKey }) => {
    setData((prev) => {
      const sourceArr = prev.posts[sourceCellKey] || [];
      const post = sourceArr.find((p) => p.id === postId);
      if (!post) return prev;

      const newSource = sourceArr.filter((p) => p.id !== postId);
      const newTarget = [...(prev.posts[targetCellKey] || []), post];

      const newPosts = { ...prev.posts, [targetCellKey]: newTarget };
      if (newSource.length === 0) {
        delete newPosts[sourceCellKey];
      } else {
        newPosts[sourceCellKey] = newSource;
      }

      return { ...prev, posts: newPosts };
    });
  };

  // ─── Platform & account handlers ───────────────────────────────────────────
  const handleAddPlatform = ({ platformName, accountName }) => {
    const platformId = generateId();
    const accountId = generateId();
    setData((prev) => ({
      ...prev,
      platforms: [
        ...prev.platforms,
        {
          id: platformId,
          name: platformName,
          accounts: [{ id: accountId, name: accountName }],
        },
      ],
    }));
    setShowAddModal(null);
  };

  const handleAddAccount = ({ platformId, accountName }) => {
    const accountId = generateId();
    setData((prev) => ({
      ...prev,
      platforms: prev.platforms.map((p) =>
        p.id === platformId
          ? { ...p, accounts: [...p.accounts, { id: accountId, name: accountName }] }
          : p
      ),
    }));
    setShowAddModal(null);
  };

  const handleDeletePlatform = (platformId) => {
    setData((prev) => {
      const platform = prev.platforms.find((p) => p.id === platformId);
      if (!platform) return prev;

      // Remove all posts for accounts in this platform
      const accountIds = new Set(platform.accounts.map((a) => a.id));
      const newPosts = {};
      Object.entries(prev.posts).forEach(([key, arr]) => {
        const accountId = key.slice(0, -(11));
        if (!accountIds.has(accountId)) newPosts[key] = arr;
      });

      return {
        ...prev,
        platforms: prev.platforms.filter((p) => p.id !== platformId),
        posts: newPosts,
      };
    });
  };

  const handleDeleteAccount = (accountId) => {
    setData((prev) => {
      // Remove posts for this account
      const newPosts = {};
      Object.entries(prev.posts).forEach(([key, arr]) => {
        const aid = key.slice(0, -(11));
        if (aid !== accountId) newPosts[key] = arr;
      });

      return {
        ...prev,
        platforms: prev.platforms.map((p) => ({
          ...p,
          accounts: p.accounts.filter((a) => a.id !== accountId),
        })),
        posts: newPosts,
      };
    });
  };

  const handleToggleCollapse = (platformId) => {
    setCollapsedPlatforms((prev) => ({ ...prev, [platformId]: !prev[platformId] }));
  };

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ backgroundColor: COLORS.bg, fontFamily: 'IBM Plex Sans, ui-sans-serif' }}
    >
      {/* App header */}
      <div
        className="px-4 py-3 border-b flex items-baseline gap-3"
        style={{ borderColor: COLORS.borderLight, backgroundColor: COLORS.cardBg }}
      >
        <h1
          className="text-2xl font-semibold"
          style={{ fontFamily: 'JetBrains Mono, monospace', color: COLORS.text }}
        >
          Content Calendar
        </h1>
        <span className="text-sm" style={{ color: COLORS.textFaint }}>
          Social Media Planner
        </span>
      </div>

      {/* Navigation bar */}
      <Navigation
        weekDates={weekDates}
        weekSpan={weekSpan}
        viewMode={viewMode}
        onPrev={() => goToPrev(weekSpan)}
        onNext={() => goToNext(weekSpan)}
        onToday={goToToday}
        onWeekSpanChange={setWeekSpan}
        onViewModeChange={setViewMode}
        onAddPlatform={() => setShowAddModal('platform')}
        onAddAccount={() => setShowAddModal('account')}
        hasPlatforms={data.platforms.length > 0}
        hiddenCount={hiddenCount}
        colors={COLORS}
      />

      {/* Filter bar */}
      <FilterBar
        filterText={filterText}
        filterStatus={filterStatus}
        filterPlatform={filterPlatform}
        onFilterTextChange={setFilterText}
        onFilterStatusChange={setFilterStatus}
        onFilterPlatformChange={setFilterPlatform}
        colors={COLORS}
      />

      {/* Calendar grid */}
      <CalendarGrid
        platforms={data.platforms}
        dates={weekDates}
        posts={data.posts}
        filteredPostIds={filteredPostIds}
        hasFilter={hasFilter}
        collapsedPlatforms={collapsedPlatforms}
        viewMode={viewMode}
        onToggleCollapse={handleToggleCollapse}
        onAddPost={handleAddPost}
        onEditPost={handleEditPost}
        onDragEnd={handleDragEnd}
        onDeletePlatform={handleDeletePlatform}
        onDeleteAccount={handleDeleteAccount}
        colors={COLORS}
      />

      {/* Post modal */}
      {editingPost && (
        <PostModal
          post={editingPost.post}
          platformName={editingPost.platformName}
          allAccounts={allAccounts}
          onSave={handleSavePost}
          onDelete={handleDeletePost}
          onDuplicate={handleDuplicatePost}
          onClose={() => setEditingPost(null)}
          colors={COLORS}
        />
      )}

      {/* Add Platform modal */}
      {showAddModal === 'platform' && (
        <AddPlatformModal
          onSave={handleAddPlatform}
          onClose={() => setShowAddModal(null)}
          colors={COLORS}
        />
      )}

      {/* Add Account modal */}
      {showAddModal === 'account' && data.platforms.length > 0 && (
        <AddAccountModal
          platforms={data.platforms}
          onSave={handleAddAccount}
          onClose={() => setShowAddModal(null)}
          colors={COLORS}
        />
      )}
    </div>
  );
}
