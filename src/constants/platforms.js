export const PLATFORMS = {
  'Twitter/X': {
    color: '#1da1f2',
    charLimit: 280,
    type: 'twitter',
    icon: '𝕏',
  },
  'Discord': {
    color: '#5865f2',
    charLimit: 2000,
    type: 'standard',
    icon: '💬',
  },
  'Telegram': {
    color: '#26a5e4',
    charLimit: 4096,
    type: 'standard',
    icon: '✈️',
  },
  'LinkedIn': {
    color: '#0077b5',
    charLimit: 3000,
    type: 'standard',
    icon: '💼',
  },
};

export const PLATFORM_NAMES = Object.keys(PLATFORMS);
