---
description: Upgrade Genius Team to the latest version
---

# /genius-upgrade

Upgrade your Genius Team installation to the latest version.

## What it does

1. Check current version from state.json
2. Fetch latest version from GitHub
3. If newer version available:
   - Show changelog/new features
   - Ask for confirmation
   - Run scripts/upgrade.sh
4. If already latest:
   - Confirm "Already up to date"

## Usage

```
/genius-upgrade
```

## Response Format

### If upgrade available:

```
🆕 New version available!

Current version: v10.0.0
Latest version: v11.0.0

What's new in v11.0:
- 🎮 12 interactive playgrounds (Design, Market, Architecture...)
- 🛡️ Anti-drift system (GENIUS_GUARD.md)
- 🧠 Active persistent memory (capture/rollup/recover)
- 📋 New commands: /guard-*, /memory-*

Would you like to proceed with the upgrade? (yes/no)
```

### On user approval:

Run: `bash scripts/upgrade.sh`

Display results and suggest: "Run /genius-start to initialize"

### If already latest:

```
✅ Genius Team is up to date (v11.0.0)
```

## Safety

- Always create backup before upgrade
- Never auto-upgrade without user confirmation
- Log upgrade to decisions.json
