# CODEX-NOTES.md — Codex CLI Compatibility Guide

This document maps Claude Code features to OpenAI Codex CLI equivalents and documents workarounds for missing features.

---

## ✅ What Works Identically

| Feature | Claude Code | Codex CLI | Status |
|---------|-------------|-----------|--------|
| **Skill Discovery** | `.claude/skills/*/SKILL.md` | `.agents/skills/*/SKILL.md` | ✅ Symlinked |
| **YAML Frontmatter** | `name`, `description` | Same | ✅ Works |
| **Instructions** | Markdown body | Same | ✅ Works |
| **Allowed Tools** | `allowed-tools:` | Supported | ✅ Works |
| **Context Isolation** | `context: fork` | Similar | ✅ Works |

---

## ⚠️ Partial Compatibility

### `skills:` Dependencies
```yaml
# Claude Code
skills:
  - genius-dev
  - genius-qa-micro
```
**Codex:** May not auto-load dependent skills. Workaround: Reference skills explicitly in instructions.

### `user-invocable:`
```yaml
user-invocable: true|false
```
**Codex:** Not explicitly supported. All skills are invocable by default.

---

## ❌ Not Supported in Codex

### 1. Hooks (`hooks:`)
Claude Code supports lifecycle hooks for logging and automation:
```yaml
hooks:
  PreToolUse:
    - type: command
      command: "bash -c 'echo ...' >> .genius/log"
  PostToolUse:
    - type: command
      command: "..."
  Stop:
    - type: command
      command: "..."
      once: true
```

**Codex Workaround:** 
- Remove hooks or keep them (Codex ignores unknown YAML keys)
- Implement logging manually in skill instructions
- Use shell scripts called from instructions

**Skills with hooks (9):**
- genius-team, genius-orchestrator, genius-dev
- genius-qa-micro, genius-debugger, genius-reviewer
- genius-qa, genius-architect, genius-specs

### 2. Task() Tool with `subagent_type`
Claude Code Agent Teams uses:
```javascript
Task({
  description: "Implement feature",
  prompt: "...",
  subagent_type: "genius-dev"
})
```

**Codex Workaround:**
- Use Codex's native delegation mechanism
- Reference skill by name in prompt
- May need to restructure orchestration flow

**Skills using Task() (5):**
- genius-orchestrator, genius-team
- genius-dual-engine, genius-qa
- genius-specs

### 3. `agent:` Frontmatter
```yaml
agent: genius-dev  # Named agent for Agent Teams
```
**Codex:** Ignored. Use explicit prompting.

---

## 📁 Path References

### `.claude/` Paths
Many skills reference:
- `.claude/plan.md` — Task execution plan
- `.claude/settings.json` — IDE settings (not relevant)

**Codex Behavior:** 
- `.claude/plan.md` still works (it's just a file path)
- Skills can read/write to `.claude/` without issues
- No need to change paths unless you want Codex-specific location

### Recommendation
Keep `.claude/plan.md` as the source of truth for both CLIs. Both can read/write to it.

---

## 🔄 Migration Checklist

For full Codex compatibility, consider:

1. **Keep hooks** — Codex ignores unknown YAML, no harm
2. **Restructure Task()** — Replace with Codex's delegation or manual orchestration
3. **Test skill loading** — Run `codex skill list` to verify
4. **Verify path access** — Ensure Codex can access `.genius/` and `.claude/`

---

## 📊 Feature Matrix

| Feature | Claude Code | Codex CLI | Notes |
|---------|:-----------:|:---------:|-------|
| Skill files (SKILL.md) | ✅ | ✅ | Identical format |
| YAML frontmatter | ✅ | ✅ | Core fields supported |
| Markdown instructions | ✅ | ✅ | Works identically |
| `hooks:` lifecycle | ✅ | ❌ | Ignored by Codex |
| `Task()` delegation | ✅ | ❌ | Use native Codex delegation |
| `subagent_type:` | ✅ | ❌ | Agent Teams specific |
| `allowed-tools:` | ✅ | ✅ | Tool permissions |
| `skills:` deps | ✅ | ⚠️ | May not auto-load |
| `context: fork` | ✅ | ✅ | Isolation supported |
| File I/O | ✅ | ✅ | Both read/write |

---

## 🚀 Quick Start for Codex

```bash
# Verify structure
ls -la .agents/skills/

# Check a skill
cat .agents/skills/genius-dev/SKILL.md

# List available skills (if Codex supports)
codex skill list
```

---

## 📝 Notes

- Symlinks point to `.claude/skills/` — single source of truth
- Edit skills in `.claude/skills/`, changes reflect in `.agents/skills/`
- Codex ignores unknown YAML keys gracefully
- Core workflow (ideation → execution → QA) works conceptually in both

---

*Generated: 2026-02-17*
*Genius Team Version: 10.0*
