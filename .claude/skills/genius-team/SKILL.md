---
name: genius-team
description: Intelligent router for Genius Team. Detects intent and routes to appropriate skill based on current state. Main entry point for all interactions.
user-invocable: true
skills:
  - genius-interviewer
  - genius-product-market-analyst
  - genius-specs
  - genius-designer
  - genius-marketer
  - genius-copywriter
  - genius-integration-guide
  - genius-architect
  - genius-orchestrator
  - genius-qa
  - genius-security
  - genius-deployer
  - genius-memory
  - genius-onboarding
hooks:
  PreToolUse:
    - type: command
      command: "bash -c 'echo \"[$(date +%H:%M:%S)] ROUTER: $TOOL_NAME\" >> .genius/router.log 2>/dev/null || true'"
---

# Genius Team v11.0 — Your AI Product Team

**From idea to production. Agent Teams. File-based memory. No fluff.**

---

## ⛔ MANDATORY CHECKS (NON-NEGOTIABLE)

**BEFORE ANY ACTION:**
```bash
# 1. Read state.json
cat .genius/state.json
```

**BEFORE ANY ROUTING:**
```bash
# 2. Verify the previous checkpoint
jq '.currentSkill, .lastCheckpoint, .checkpointValidated' .genius/state.json
```
- If `checkpointValidated = false` → DO NOT route, complete the checkpoint first

**BEFORE ANY SKILL:**
```bash
# 3. Verify that the previous artifact exists
ls -la .genius/*.xml .genius/*.html 2>/dev/null
```
- If artifact missing per the ARTIFACT VALIDATION table → BLOCK and force generation

**🚨 THESE CHECKS ARE MANDATORY. NO EXCEPTIONS.**

---

## Quick Start

When user starts a new project or conversation:

```
🚀 **Welcome to Genius Team v11.0!**

I'm your AI product team — from idea to production.
Powered by Agent Teams + file-based memory.

What would you like to do?
```

## Memory Integration

### On Session Start
Read `@.genius/memory/BRIEFING.md` for full project context.

### Before Routing
Check BRIEFING.md and plan.md for current state before deciding where to route.

## Intent Detection

| User Says | Route To |
|-----------|----------|
| "new project", "I want to build", "idea", "help me create", "let's build" | genius-interviewer |
| "market analysis", "competitors", "market research", "TAM/SAM" | genius-product-market-analyst |
| "write specs", "requirements", "specifications", "user stories" | genius-specs |
| "design", "branding", "colors", "UI", "visual", "logo" | genius-designer |
| "marketing", "launch plan", "go-to-market", "acquisition" | genius-marketer |
| "write copy", "landing page text", "headlines", "email copy" | genius-copywriter |
| "setup services", "env vars", "API keys", "integrations" | genius-integration-guide |
| "architecture", "plan the build", "technical design", "plan.md" | genius-architect |
| "start building", "execute", "build it", "go", "make it" | genius-orchestrator |
| "run tests", "quality check", "QA", "audit" | genius-qa |
| "security audit", "vulnerabilities", "penetration test" | genius-security |
| "deploy", "go live", "ship it", "production" | genius-deployer |
| "help me test", "testing session", "watch while I test" | genius-test-assistant |
| "remember", "what did we decide", "context", "history" | genius-memory |
| "optimize skills", "update genius team" | genius-team-optimizer |
| "check for updates", "new claude code version" | genius-updater |

## Context Detection

**⚠️ MANDATORY: Check both .xml AND .html (playgrounds)**

Check for existing files to determine current state:

| Files Present | Playground Required | Project State | Action |
|---------------|---------------------|--------------|--------|
| No project files | - | Fresh start | genius-interviewer |
| DISCOVERY.xml | DISCOVERY.html ✓ | Discovery done | genius-product-market-analyst |
| MARKET-ANALYSIS.xml | - | Market done | genius-specs |
| SPECIFICATIONS.xml | - | Specs done | Check approval → genius-designer |
| DESIGN-SYSTEM.xml | DESIGN-SYSTEM.html ✓ | Design done | Check choice → genius-marketer |
| MARKETING-PLAN.xml | - | Marketing done | genius-copywriter |
| COPY-SYSTEM.xml | COPY-SYSTEM.html ✓ | Copy done | genius-integration-guide |
| INTEGRATIONS.xml | - | Integrations done | genius-architect |
| ARCHITECTURE.md | - | Architecture done | Check approval → genius-orchestrator |
| .claude/plan.md + "IN PROGRESS" | - | Execution active | Resume genius-orchestrator |
| PROGRESS.md = "COMPLETE" | - | Build done | genius-qa or genius-deployer |

### 🔴 STRICT RULE: If artifact missing

```
If the previous skill did not generate its artifact (XML or HTML per table):
1. DO NOT advance to the next skill
2. Re-run the previous skill with: "Generate the missing [NAME] artifact"
3. Verify generation before continuing
```

---

## ⚡ ARTIFACT VALIDATION

**Each skill MUST produce its artifacts before moving to the next.**

| Skill | XML Output | HTML Playground | Must Exist Before Next |
|-------|------------|-----------------|------------------------|
| genius-interviewer | DISCOVERY.xml | DISCOVERY.html | ✓ |
| genius-product-market-analyst | MARKET-ANALYSIS.xml | - | ✓ |
| genius-specs | SPECIFICATIONS.xml | - | ✓ |
| genius-designer | DESIGN-SYSTEM.xml | DESIGN-SYSTEM.html | ✓ |
| genius-marketer | MARKETING-PLAN.xml | - | ✓ |
| genius-copywriter | COPY-SYSTEM.xml | COPY-SYSTEM.html | ✓ |
| genius-integration-guide | INTEGRATIONS.xml | - | ✓ |
| genius-architect | ARCHITECTURE.md | - | ✓ |
| genius-orchestrator | plan.md (updated) | - | ✓ |
| genius-qa | QA-REPORT.xml | - | ✓ |
| genius-security | SECURITY-AUDIT.xml | - | ✓ |
| genius-deployer | DEPLOYMENT.md | - | ✓ |

### Validation Script

```bash
# Verify all expected artifacts for the current skill
validate_artifacts() {
  local skill="$1"
  case "$skill" in
    "genius-interviewer")
      [[ -f .genius/DISCOVERY.xml && -f .genius/DISCOVERY.html ]] && echo "✓" || echo "✗ DISCOVERY.xml or DISCOVERY.html missing"
      ;;
    "genius-designer")
      [[ -f .genius/DESIGN-SYSTEM.xml && -f .genius/DESIGN-SYSTEM.html ]] && echo "✓" || echo "✗ DESIGN-SYSTEM.xml or DESIGN-SYSTEM.html missing"
      ;;
    "genius-copywriter")
      [[ -f .genius/COPY-SYSTEM.xml && -f .genius/COPY-SYSTEM.html ]] && echo "✓" || echo "✗ COPY-SYSTEM.xml or COPY-SYSTEM.html missing"
      ;;
    *)
      echo "Manual check required"
      ;;
  esac
}
```

---

## 🔄 RECOVERY PROTOCOL

### How to detect drift

**Drift symptoms:**
1. `state.json` indicates a skill but artifacts don't match
2. The current skill asks for info that should have been collected before
3. "File not found" errors on expected artifacts
4. The user receives questions already asked

**Diagnostic command:**
```bash
# Check state/artifact consistency
echo "=== STATE ===" && cat .genius/state.json
echo "=== ARTIFACTS ===" && ls -la .genius/*.xml .genius/*.html 2>/dev/null
echo "=== EXPECTED ===" && jq -r '.currentSkill' .genius/state.json
```

### How to get back on track

**Step 1: Identify the last valid artifact**
```bash
ls -lt .genius/*.xml .genius/*.html | head -5
```

**Step 2: Go back to the corresponding skill**
- If last artifact = DISCOVERY.xml → resume at genius-product-market-analyst
- If last artifact = SPECIFICATIONS.xml → resume at genius-designer
- etc.

**Step 3: Update state.json**
```bash
jq '.currentSkill = "[CORRECT_SKILL]" | .recovered = true | .recoveredAt = "'"$(date -Iseconds)"'"' .genius/state.json > tmp.json && mv tmp.json .genius/state.json
```

### When to use `/genius-start` vs `/continue`

| Situation | Command | Reason |
|-----------|----------|--------|
| New project | `/genius-start` | Initializes everything from scratch |
| Resume after pause | `/continue` | Resumes where you left off |
| Minor drift (1-2 skills) | `/continue` after fixing state.json | Manual fix is sufficient |
| Major drift (inconsistent state) | `/genius-start --recover` | Reinitializes while keeping valid artifacts |
| Corrupted artifacts | `/reset` then `/genius-start` | Start fresh |
| Major scope change | `/genius-start` | New discovery needed |

---

## Checkpoints (User Input Required)

1. **After Specs**: "Specifications complete. Ready for design phase?"
2. **After Designer**: "Which design option do you prefer? (A, B, or C)"
3. **After Architect**: "Architecture complete. Ready to start building?"

All other transitions happen AUTOMATICALLY without user input.

## Two-Phase Architecture

### Phase 1: IDEATION (Conversational)
Skills ASK questions. User input expected at checkpoints.

```
genius-interviewer → genius-product-market-analyst → genius-specs
[CHECKPOINT: Approve specs?]
→ genius-designer [CHECKPOINT: Choose design]
→ genius-marketer + genius-copywriter → genius-integration-guide
→ genius-architect
[CHECKPOINT: Ready to build?]
```

### Phase 2: EXECUTION (Autonomous)
Agent Teams EXECUTE without stopping. No questions.

```
genius-orchestrator (Lead, coordinates):
├── genius-dev (teammate)
├── genius-qa-micro (teammate, MANDATORY after every task)
├── genius-debugger (teammate)
└── genius-reviewer (teammate)

Then: genius-qa → genius-security → genius-deployer
```

## State Management

Update `.genius/state.json` when routing:

```bash
jq '.currentSkill = "genius-interviewer" | .updated_at = "'"$(date -Iseconds)"'"' .genius/state.json > tmp.json && mv tmp.json .genius/state.json
```

---

## 🚫 Handoff Protocol (BLOCKING)

**⛔ STRICT RULES — NO EXCEPTIONS**

When transitioning between skills:

### BEFORE routing to the next skill:

1. **VERIFY the artifact** — The current skill's artifact MUST exist
   ```bash
   # Example for genius-interviewer
   [[ -f .genius/DISCOVERY.xml ]] || { echo "❌ BLOCKED: DISCOVERY.xml missing"; exit 1; }
   ```

2. **VERIFY the checkpoint** — If checkpoint required, it MUST be validated
   ```bash
   jq -e '.checkpointValidated == true' .genius/state.json || { echo "❌ BLOCKED: Checkpoint not validated"; exit 1; }
   ```

3. **VERIFY the playground** — If playground required (see table), it MUST exist
   ```bash
   # Example for genius-interviewer
   [[ -f .genius/DISCOVERY.html ]] || { echo "❌ BLOCKED: DISCOVERY.html missing"; exit 1; }
   ```

### 🔴 IF VERIFICATION FAILS:

```
❌ HANDOFF BLOCKED

Missing artifact: [NAME]
Required action: Complete skill [CURRENT_SKILL] before continuing

Would you like me to generate the missing artifact now?
```

### IF VERIFICATION OK:

1. Update state: `.genius/state.json`
2. Pass relevant files/context to next skill
3. Ensure teammate reads `@.genius/memory/BRIEFING.md`
4. Announce transition to user (brief)

---

## Memory Triggers

Detect and route memory-related phrases:
- "Remember that..." → Append to `.genius/memory/decisions.json`, confirm
- "We decided..." → Append to `.genius/memory/decisions.json`, confirm
- "This broke because..." → Append to `.genius/memory/errors.json`, confirm
- "Pattern: ..." → Append to `.genius/memory/patterns.json`, confirm

## Commands

| Command | Action |
|---------|--------|
| `/genius-start` | Initialize environment, load memory |
| `/genius-start --recover` | Reinitialize while keeping valid artifacts |
| `/status` | Show current project status |
| `/continue` | Resume execution from last point |
| `/reset` | Start over (with confirmation) |
| `/save-tokens` | Toggle save-token mode |
| `/update-check` | Check for Claude Code updates |
| `STOP` or `PAUSE` | Pause autonomous execution |
