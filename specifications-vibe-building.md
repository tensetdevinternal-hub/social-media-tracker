# Genius Team Platform — Vibe Building Specifications
**Version:** 1.0 — Draft
**Date:** 2026-02-18
**Author:** Ben Bellity + Echo (AI)

---

## Vision

> **"Vibe Building: from idea to launch, as a team, orchestrated by AI."**

**Vibe Coding** = one dev + one AI to code fast.
**Vibe Building** = a full team + specialized AIs to build a product from A to Z — from ideation to deployment.

Genius Team is today the best Vibe Building tool for a solo person. The platform is the natural extension for teams — without excluding non-technical members, by including them in their business language.

---

## Key Concept: The Shared Brain

Each team member has their AI pair. All AIs share the same project context (`shared state`). The CEO speaks vision. The marketer speaks audience. The dev speaks code. The AI orchestrates and translates.

```
SHARED PROJECT BRAIN (state.json)
         │
┌────────┼────────┬────────┬────────┐
▼        ▼        ▼        ▼        ▼
CEO    Designer  Marketer   Dev     PM
+ AI   + AI      + AI     + AI    + AI
Vision  UX/UI   Messaging  Code  Roadmap
```

---

## 1. Onboarding & Team Management

### 1.1 Account Creation
- Email/password + OAuth (Google, GitHub)
- Profile: name, role (`founder`, `designer`, `marketer`, `dev`, `pm`, `qa`)
- The role determines the interface, assigned AI agents, and permissions

### 1.2 Team & Project Creation
1. The founder creates a team + a project on genius.w3art.io
2. Member invitation by email (tokenized link, expires in 72h)
3. Each member chooses their role at signup
4. AI key setup (see section 2)

### 1.3 Permission Management

| Permission | Owner | Admin | Member |
|------------|-------|-------|--------|
| Invite members | ✅ | ✅ | ❌ |
| Modify settings | ✅ | ✅ | ❌ |
| Deploy | ✅ | ✅ | ❌ |
| Contribute to phases | ✅ | ✅ | ✅ |
| Vote | ✅ | ✅ | ✅ |
| View terminal | ✅ | ✅ | ✅ (read-only) |
| Control terminal | ✅ | ✅ | ❌ |

---

## 2. AI Account Management

### 2.1 v1 Mode: BYO Account (Bring Your Own Subscription)

Each user **connects their subscription** via OAuth — no API key to copy-paste:

| Button | Required Subscription | User Cost |
|--------|---------------------|-----------------|
| "Connect Claude" | Claude Pro ($20/month) or Max | ~$20/month flat |
| "Connect OpenAI" | ChatGPT Plus ($20/month) or Teams | ~$20/month flat |

**OAuth Flow:**
1. The user clicks "Connect Claude" on the platform
2. Redirected to claude.ai to authorize access
3. The platform receives an OAuth token (not an API key)
4. Each AI call is made via the user's credentials
5. The user's subscription is consumed (not ours)

**Advantages vs API key:**
- Predictable cost ($20/month vs potentially $100-200+ in pay-per-token)
- No risk of surprise overages
- The user controls their own subscription
- The platform never stores sensitive API keys

**Technical note:** OAuth tokens are encrypted (AES-256) and refreshed automatically.

### 2.2 "Free Credits" Program (partnership)

Instead of reselling tokens (legal risk), the platform:
- Positions itself as a **partner acquisition channel** for Anthropic and OpenAI
- Negotiates **free credits** for new teams (e.g., $50 of Claude credits at signup)
- Generates revenue via premium onboarding and services (see section 8)

### 2.3 Engine Choice by Phase

```
Discovery Phase   → Claude or Codex (configurable)
Market Phase      → Claude or Codex
Dev Phase         → Claude Code OR Codex CLI OR Dual Mode
Review Phase      → Dual Mode recommended (Claude build, Codex challenge)
```

---

## 3. Chat Interface — genius-bot (Telegram)

### 3.1 Assisted Team Chat Creation

1. Founder clicks "Create team chat" on the platform
2. The platform automatically creates a private Telegram group
3. All invited members are added
4. @genius-bot is added and introduces itself as the orchestrator

### 3.2 Bot Architecture

```
@genius-bot (orchestrator)
  ├── @genius-interviewer-bot   → Discovery Phase (questions, reformulations)
  ├── @genius-market-bot        → Market Phase (analysis, insights)
  ├── @genius-design-bot        → Design Phase (UX guidance, system design)
  ├── @genius-dev-bot           → Dev Phase (code snippets, architecture)
  ├── @genius-qa-bot            → QA Phase (test scenarios, criteria)
  └── @genius-vote-bot          → Votes & consensus
```

**Behavior:**
- @genius-bot facilitates and guides the discussion according to the active phase
- Each bot is invoked automatically when its phase begins
- Bots read the `shared state` to contextualize their responses
- Voice notes support → auto transcription → AI response

### 3.3 Typical Interactions

```
👤 Marie (Designer): "I want a clean design, inspired by Apple"
🤖 @genius-design-bot: "Perfect. For an Apple-like style, here are
   the key principles for your TaskFlow project: [...]
   I'm updating the Design System in the dashboard."

👤 Thomas (CEO): "We should target SMBs instead"
🤖 @genius-market-bot: "Thomas, analyzing... 83% of current
   discovery users match the SMB profile.
   I'm submitting an ICP revision to the team. /vote launched."
```

---

## 4. Consensus & Voting System

### 4.1 Consensus Parameter

Configurable per project:
```
consensus_mode: "human" | "bot"
```

- **human**: The designated Lead decides. The bot presents each side's arguments in a synthesized way.
- **bot**: The AI decides based on specs, best practices, and project context.

### 4.2 Voting Mechanism

Triggered by `@genius-vote-bot` or by any member:

```
/vote "Frontend stack: Next.js or Nuxt.js?"
→ Options: Next.js · Nuxt.js · Let the AI decide
→ Timer: 2h (configurable)
→ Quorum: 50%+1 (configurable)
→ If timer expires without quorum → consensus_mode takes over
```

**Vote types:**
- Technical choice (stack, architecture, tooling)
- Feature priority (what do we build first?)
- Phase validation (moving to the next step)
- Business decision (pricing, pivot, target)

**Result:** Automatically logged in `shared/decisions.json` with rationale and vote history.

---

## 5. Web Dashboard

### 5.1 Overview

Web interface accessible by all members from any browser. No installation required. Updated in real-time via WebSocket.

### 5.2 Tabs — Genius Team Phases

```
[🎯 Discovery] [📊 Market] [📋 Specs] [🎨 Design] [💻 Dev] [🧪 QA] [🚀 Deploy]
```

Each tab displays the **complete playground** for the phase (not a summary):
- Live indicator: "Who's working on this now" (avatars)
- Contribution history by member
- "Request review" button → notification in the Telegram chat
- Status: Pending · In Progress · In Review · Completed

### 5.3 Additional Views

**🗺️ Team Map**
- Who's doing what right now
- Each member's availability
- Assigned vs pending tasks

**📊 Project Progress**
- % completion per phase
- Estimated vs actual timeline
- Team velocity

**💬 Decisions Log**
- All decisions made (manual + AI)
- Context, date, decision-maker
- Ability to revert (revert decision)

**🗳️ Active Votes**
- Ongoing votes with countdown
- Past vote results

---

## 6. Web CLI — Integrated Terminal

### 6.1 Philosophy

The terminal is not hidden from non-technical members — it is **visible in spectator mode**. Seeing the AI code in real-time creates the "WOW moment" that engages non-technical members.

```
Non-tech member → Sees the terminal live (read-only)
                → Sees the AI generate code
                → "Take Control" button available
                → WOW moment + sense of ownership
```

### 6.2 Technical Stack

```
Frontend : xterm.js (terminal emulator)
Backend  : node-pty (server-side pseudo-terminal)
Protocol : WebSocket (bidirectional)
Container: Isolated sandbox per project (Docker or lightweight VM)
```

### 6.3 How It Works

- Full terminal in the browser
- Claude Code or Codex CLI pre-installed in the container
- The project repo is pre-cloned
- Write access: `dev` and `lead` only
- Read access (live view): all members
- Integrated git push/pull with visual feedback

### 6.4 Visible In

- **Dev** tab of the dashboard (main)
- Collapsible panel on all other tabs for devs

---

## 7. Deployment & External Setup

### 7.1 Guided Mode (Guide-Me)

The platform guides the team step-by-step to configure external services:

```
Step 1: GitHub → Create repo + push initial code
Step 2: Vercel → Connect repo + first frontend deployment
Step 3: Railway → Provision backend + database
Step 4: Stripe → Configure payments (if applicable)
Step 5: Resend/Loops → Transactional email
```

Each step: illustrated instructions + automatic validation when done.

### 7.2 Autopilot Mode (Turnkey)

The platform acts via OAuth on external services:

```
OAuth GitHub → Create repo, configure branch protection, add collaborators
OAuth Vercel → Create project, setup custom domain, env variables
OAuth Railway → Provision DB, deploy backend, setup secrets
```

The user authorizes each service once. The platform handles the rest.

**Result:** The team receives production URLs + credentials in a secure dashboard.

---

## 8. Revenue Model (v1)

| Source | Description | Estimated Amount |
|--------|-------------|----------------|
| 💰 **Platform subscription** | Freemium → Team → Pro | 0 / $49 / $99/month |
| 🤝 **Premium onboarding** | Complete setup guided by the team | $299-999 one-shot |
| 🎓 **Vibe Building bootcamp** | Team training (4h, async or live) | $199/participant |
| 🔌 **Autopilot Setup** | Turnkey configuration for all services | $199-499 one-shot |
| 🤝 **Anthropic/OpenAI partnership** | Free credits for new users via partner deal | TBD |

### Plans

| Plan | Price | Limits |
|------|------|---------|
| **Free** | $0 | 1 project · 3 members · BYO keys |
| **Team** | $49/month | 5 projects · 10 members · BYO keys |
| **Pro** | $99/month | Unlimited projects · Unlimited members · Autopilot deploy |
| **Enterprise** | Custom quote | White-label · SLA · Dedicated support |

---

## 9. Technical Stack

```
Frontend    : Next.js 15 (App Router) + Tailwind
Backend     : Node.js + Fastify (API) + WebSocket
Database    : Supabase (PostgreSQL + Auth + Realtime + Storage)
Auth        : Supabase Auth (email + OAuth Google/GitHub)
Telegram    : Grammy.js (multi-instance bots)
Web CLI     : xterm.js + node-pty + WebSocket
AI Layer    : Anthropic SDK + OpenAI SDK (routing per user config)
Real-time   : Supabase Realtime (dashboard) + Socket.io (terminal)
Containers  : Docker (Web CLI sandbox per project)
Deploy      : Vercel (frontend) + Railway (backend + bots + containers)
Payments    : Stripe (subscriptions + one-shots)
Email       : Resend (invitations, notifications)
```

---

## 10. Data Model

```
User
  ├── id, email, name, role
  └── api_keys (encrypted)

Team
  ├── id, name, owner_id
  └── members → User[] (via Membership)

Project
  ├── id, team_id, name, engine (claude|codex|dual)
  ├── consensus_mode (human|bot)
  ├── current_phase
  └── phases → Phase[]

Phase
  ├── id, project_id, type (discovery|market|specs|...)
  ├── status (pending|in-progress|review|completed)
  ├── assigned_to → User[]
  └── artifacts → Artifact[]

Artifact
  ├── id, phase_id, type, content (JSON)
  └── created_by (human|ai), created_at

Decision
  ├── id, project_id, question, outcome
  ├── decided_by (user_id | "ai")
  └── context, created_at

Vote
  ├── id, project_id, question, options[]
  ├── timer_ends_at, quorum
  ├── status (active|resolved|expired)
  └── votes → VoteChoice[]

Message
  ├── id, project_id, source (telegram|platform)
  ├── sender (user_id | bot_name)
  └── content, created_at
```

---

## 11. What We Already Have (Reusable)

| Asset | How It's Reused |
|-------|-------------------|
| `project-dashboard.html` | Web Dashboard base (ported to React) |
| 12 playground HTMLs | Dashboard tabs |
| `state.json` schema | Project/Phase data model |
| 25 Genius Team skills | Telegram bot logic |
| xterm.js (Jarvis) | Integrated Web CLI |
| `genius-dual-engine` skill | Dual Mode for Dev phase |
| Scripts `create.sh` / `setup.sh` | Autopilot Onboarding |

---

## 12. Roadmap

### v1 — "Founder + Dev" (MVP)
- [ ] Auth + teams + invitations
- [ ] Real-time shared state
- [ ] Dashboard with 7 tabs (phases)
- [ ] Telegram bot (genius-bot orchestrator)
- [ ] BYO API keys
- [ ] Web CLI (read-only spectator + dev control)

### v2 — "Full Team"
- [ ] Specialized bots per phase
- [ ] Voting system
- [ ] Dual Mode integrated in dashboard
- [ ] Guided deploy (Guide-Me)

### v3 — "Scale"
- [ ] Autopilot Deploy
- [ ] Anthropic/OpenAI partnership program
- [ ] Self-service premium onboarding
- [ ] Analytics & reporting

---

## Meta-note

The platform is itself built using **Vibe Building** — using Genius Team to build itself. It's the best possible demo and the best marketing argument: **"We built this platform with our own tool."**

---

*Living document — to be updated as team decisions are made.*
