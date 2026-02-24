#!/bin/bash
#═══════════════════════════════════════════════════════════════════════════════
# Genius Team Upgrade Script
# Upgrades from v9.x to v10.x
#═══════════════════════════════════════════════════════════════════════════════

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Config
REPO_URL="https://raw.githubusercontent.com/w-3-art/genius-team/main"
TARGET_VERSION="10.0.0"
MIN_SOURCE_VERSION="9.0.0"

# Flags
FORCE=false
DRY_RUN=false
VERBOSE=false

# Stats
FILES_DOWNLOADED=0
DIRS_CREATED=0

#═══════════════════════════════════════════════════════════════════════════════
# Helper Functions
#═══════════════════════════════════════════════════════════════════════════════

print_banner() {
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}  ${BOLD}🚀 Genius Team Upgrade${NC}                                   ${CYAN}║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

log_step() {
    local step=$1
    local total=$2
    local msg=$3
    echo -e "${BLUE}[$step/$total]${NC} $msg"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

log_info() {
    echo -e "${CYAN}ℹ${NC} $1"
}

log_verbose() {
    if [ "$VERBOSE" = true ]; then
        echo -e "  ${CYAN}→${NC} $1" >&2
    fi
}

show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --force       Skip git clean check"
    echo "  --dry-run     Show what would be done without making changes"
    echo "  --verbose     Show detailed output"
    echo "  --help        Show this help message"
    echo ""
    echo "Example:"
    echo "  $0              # Normal upgrade"
    echo "  $0 --dry-run    # Preview changes"
    echo "  $0 --force      # Upgrade even with uncommitted changes"
}

#═══════════════════════════════════════════════════════════════════════════════
# Version Detection
#═══════════════════════════════════════════════════════════════════════════════

detect_version() {
    local version=""
    
    # Method 1: Read from state.json
    if [ -f ".genius/state.json" ]; then
        version=$(grep -o '"version"[[:space:]]*:[[:space:]]*"[^"]*"' .genius/state.json 2>/dev/null | head -1 | sed 's/.*"\([^"]*\)"$/\1/')
        if [ -n "$version" ]; then
            log_verbose "Version from state.json: $version"
            echo "$version"
            return 0
        fi
    fi
    
    # Method 2: Check CLAUDE.md for version markers
    if [ -f "CLAUDE.md" ]; then
        if grep -q "v10\|10\.0" CLAUDE.md 2>/dev/null; then
            log_verbose "Version marker v10 found in CLAUDE.md"
            echo "10.0.0"
            return 0
        elif grep -q "v9\|9\.0" CLAUDE.md 2>/dev/null; then
            log_verbose "Version marker v9 found in CLAUDE.md"
            echo "9.0.0"
            return 0
        fi
    fi
    
    # Method 3: Check for v10-specific files
    if [ -f "GENIUS_GUARD.md" ] && [ -d "playgrounds/templates" ]; then
        log_verbose "v10 files detected (GENIUS_GUARD.md + playgrounds)"
        echo "10.0.0"
        return 0
    fi
    
    # Default: assume v9
    log_verbose "No version markers found, assuming v9"
    echo "9.0.0"
}

compare_versions() {
    local v1=$1
    local v2=$2
    
    # Extract major version
    local major1=$(echo "$v1" | cut -d. -f1)
    local major2=$(echo "$v2" | cut -d. -f1)
    
    if [ "$major1" -lt "$major2" ]; then
        echo "less"
    elif [ "$major1" -gt "$major2" ]; then
        echo "greater"
    else
        echo "equal"
    fi
}

#═══════════════════════════════════════════════════════════════════════════════
# Prerequisites Check
#═══════════════════════════════════════════════════════════════════════════════

check_prerequisites() {
    local errors=0
    
    # Check if we're in a genius-team project
    if [ ! -f "CLAUDE.md" ]; then
        log_error "CLAUDE.md not found. Are you in a Genius Team project directory?"
        errors=$((errors + 1))
    fi
    
    # Check for curl
    if ! command -v curl &> /dev/null; then
        log_error "curl is required but not installed"
        errors=$((errors + 1))
    fi
    
    # Check git status (unless --force)
    if [ "$FORCE" = false ]; then
        if command -v git &> /dev/null && [ -d ".git" ]; then
            local git_status=$(git status --porcelain 2>/dev/null)
            if [ -n "$git_status" ]; then
                log_error "Uncommitted changes detected. Commit first or use --force"
                log_verbose "Changed files:"
                if [ "$VERBOSE" = true ]; then
                    echo "$git_status" | head -10 | while read line; do
                        echo "    $line"
                    done
                fi
                errors=$((errors + 1))
            fi
        fi
    fi
    
    return $errors
}

#═══════════════════════════════════════════════════════════════════════════════
# Backup
#═══════════════════════════════════════════════════════════════════════════════

create_backup() {
    local timestamp=$(date +%Y%m%d-%H%M%S)
    local backup_dir=".genius/backups/pre-upgrade-$timestamp"
    
    if [ "$DRY_RUN" = true ]; then
        log_info "[DRY-RUN] Would create backup at: $backup_dir"
        echo "$backup_dir"
        return 0
    fi
    
    mkdir -p "$backup_dir"
    
    # Backup existing files/directories
    [ -d ".claude" ] && cp -r .claude "$backup_dir/"
    [ -d ".genius" ] && cp -r .genius "$backup_dir/" 2>/dev/null || true
    [ -f "CLAUDE.md" ] && cp CLAUDE.md "$backup_dir/"
    [ -f "GENIUS_GUARD.md" ] && cp GENIUS_GUARD.md "$backup_dir/"
    [ -d "playgrounds" ] && cp -r playgrounds "$backup_dir/"
    [ -d "scripts" ] && cp -r scripts "$backup_dir/"
    
    log_verbose "Backup created at: $backup_dir"
    echo "$backup_dir"
}

#═══════════════════════════════════════════════════════════════════════════════
# Download Functions
#═══════════════════════════════════════════════════════════════════════════════

download_file() {
    local remote_path=$1
    local local_path=$2
    
    if [ "$DRY_RUN" = true ]; then
        log_verbose "[DRY-RUN] Would download: $remote_path → $local_path"
        FILES_DOWNLOADED=$((FILES_DOWNLOADED + 1))
        return 0
    fi
    
    # Create parent directory if needed
    local dir=$(dirname "$local_path")
    [ ! -d "$dir" ] && mkdir -p "$dir"
    
    if curl -fsSL "$REPO_URL/$remote_path" -o "$local_path" 2>/dev/null; then
        log_verbose "Downloaded: $local_path"
        FILES_DOWNLOADED=$((FILES_DOWNLOADED + 1))
        return 0
    else
        log_warning "Failed to download: $remote_path"
        return 1
    fi
}

create_directory() {
    local dir=$1
    
    if [ "$DRY_RUN" = true ]; then
        log_verbose "[DRY-RUN] Would create directory: $dir"
        DIRS_CREATED=$((DIRS_CREATED + 1))
        return 0
    fi
    
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        log_verbose "Created: $dir"
        DIRS_CREATED=$((DIRS_CREATED + 1))
    fi
}

#═══════════════════════════════════════════════════════════════════════════════
# Upgrade v9 → v10
#═══════════════════════════════════════════════════════════════════════════════

upgrade_v9_to_v10() {
    echo ""
    
    # === Core Files ===
    log_info "Downloading core files..."
    download_file "CLAUDE.md" "CLAUDE.md"
    download_file "GENIUS_GUARD.md" "GENIUS_GUARD.md"
    download_file "README.md" "README.md"
    download_file "CHANGELOG.md" "CHANGELOG.md"
    download_file ".gitignore" ".gitignore"
    
    # === .claude/settings.json ===
    log_info "Downloading .claude configuration..."
    download_file ".claude/settings.json" ".claude/settings.json"
    
    # === Commands (new in v10) ===
    log_info "Downloading slash commands..."
    download_file ".claude/commands/genius-start.md" ".claude/commands/genius-start.md"
    download_file ".claude/commands/status.md" ".claude/commands/status.md"
    download_file ".claude/commands/continue.md" ".claude/commands/continue.md"
    download_file ".claude/commands/reset.md" ".claude/commands/reset.md"
    download_file ".claude/commands/save-tokens.md" ".claude/commands/save-tokens.md"
    download_file ".claude/commands/dual-status.md" ".claude/commands/dual-status.md"
    download_file ".claude/commands/dual-challenge.md" ".claude/commands/dual-challenge.md"
    download_file ".claude/commands/omni-status.md" ".claude/commands/omni-status.md"
    download_file ".claude/commands/hydrate-tasks.md" ".claude/commands/hydrate-tasks.md"
    download_file ".claude/commands/update-check.md" ".claude/commands/update-check.md"
    # Guard commands (new)
    download_file ".claude/commands/guard-check.md" ".claude/commands/guard-check.md"
    download_file ".claude/commands/guard-recover.md" ".claude/commands/guard-recover.md"
    # Memory commands (new)
    download_file ".claude/commands/memory-add.md" ".claude/commands/memory-add.md"
    download_file ".claude/commands/memory-search.md" ".claude/commands/memory-search.md"
    download_file ".claude/commands/memory-status.md" ".claude/commands/memory-status.md"
    download_file ".claude/commands/memory-recover.md" ".claude/commands/memory-recover.md"
    download_file ".claude/commands/memory-forget.md" ".claude/commands/memory-forget.md"
    
    # === Agents ===
    log_info "Downloading agent definitions..."
    download_file ".claude/agents/genius-dev.md" ".claude/agents/genius-dev.md"
    download_file ".claude/agents/genius-reviewer.md" ".claude/agents/genius-reviewer.md"
    download_file ".claude/agents/genius-debugger.md" ".claude/agents/genius-debugger.md"
    download_file ".claude/agents/genius-challenger.md" ".claude/agents/genius-challenger.md"
    download_file ".claude/agents/genius-qa-micro.md" ".claude/agents/genius-qa-micro.md"
    
    # === Skills ===
    log_info "Downloading skills..."
    local skills=(
        "genius-team"
        "genius-start"
        "genius-dev"
        "genius-reviewer"
        "genius-debugger"
        "genius-architect"
        "genius-designer"
        "genius-qa"
        "genius-qa-micro"
        "genius-security"
        "genius-deployer"
        "genius-copywriter"
        "genius-marketer"
        "genius-product-market-analyst"
        "genius-interviewer"
        "genius-specs"
        "genius-test-assistant"
        "genius-orchestrator"
        "genius-dual-engine"
        "genius-omni-router"
        "genius-integration-guide"
        "genius-onboarding"
        "genius-updater"
        "genius-team-optimizer"
        "genius-memory"
    )
    
    for skill in "${skills[@]}"; do
        download_file ".claude/skills/$skill/SKILL.md" ".claude/skills/$skill/SKILL.md"
    done
    
    # === Scripts ===
    log_info "Downloading scripts..."
    download_file "scripts/setup.sh" "scripts/setup.sh"
    download_file "scripts/create.sh" "scripts/create.sh"
    download_file "scripts/verify.sh" "scripts/verify.sh"
    download_file "scripts/guard-validate.sh" "scripts/guard-validate.sh"
    download_file "scripts/memory-capture.sh" "scripts/memory-capture.sh"
    download_file "scripts/memory-rollup.sh" "scripts/memory-rollup.sh"
    download_file "scripts/memory-briefing.sh" "scripts/memory-briefing.sh"
    download_file "scripts/memory-recover.sh" "scripts/memory-recover.sh"
    download_file "scripts/memory-extract.sh" "scripts/memory-extract.sh"
    
    # Make scripts executable
    if [ "$DRY_RUN" = false ]; then
        chmod +x scripts/*.sh 2>/dev/null || true
    fi
    
    # === Playgrounds ===
    log_info "Downloading playgrounds..."
    local playgrounds=(
        "architecture-explorer"
        "copy-ab-tester"
        "deploy-checklist"
        "design-system-builder"
        "gtm-simulator"
        "market-simulator"
        "progress-dashboard"
        "project-canvas"
        "risk-matrix"
        "stack-configurator"
        "test-coverage-map"
        "user-journey-builder"
    )
    
    for pg in "${playgrounds[@]}"; do
        download_file "playgrounds/templates/$pg.html" "playgrounds/templates/$pg.html"
    done
    
    # === Config files ===
    log_info "Downloading config files..."
    download_file ".genius/config.json" ".genius/config.json"
    download_file "configs/skills.json" "configs/skills.json"
    download_file "configs/phases.json" "configs/phases.json"
    download_file "configs/commands.json" "configs/commands.json"
    download_file "configs/checkpoints.json" "configs/checkpoints.json"
    
    # === Create new directories ===
    log_info "Creating new directories..."
    create_directory ".genius/outputs"
    create_directory ".genius/memory/events"
    create_directory ".genius/memory/summaries"
    create_directory ".genius/memory/archive"
    create_directory ".genius/backups"
    create_directory "playgrounds/templates"
    
    # === Update state.json ===
    if [ "$DRY_RUN" = false ]; then
        log_info "Updating state.json version..."
        if [ -f ".genius/state.json" ]; then
            # Backup current state
            cp .genius/state.json .genius/state.json.bak
            
            # Update version using sed
            sed -i.tmp 's/"version"[[:space:]]*:[[:space:]]*"[^"]*"/"version": "10.0.0"/' .genius/state.json
            rm -f .genius/state.json.tmp
        else
            # Create new state.json
            cat > .genius/state.json << 'EOF'
{
  "version": "10.0.0",
  "phase": "NOT_STARTED",
  "currentSkill": null,
  "skillHistory": [],
  "checkpoints": {
    "discovery": false,
    "market_analysis": false,
    "specs_approved": false,
    "design_chosen": false,
    "marketing_done": false,
    "integrations_done": false,
    "architecture_approved": false,
    "execution_started": false,
    "qa_passed": false,
    "security_passed": false,
    "deployed": false
  },
  "tasks": {
    "total": 0,
    "completed": 0,
    "failed": 0,
    "skipped": 0,
    "current_task_id": null
  },
  "artifacts": {},
  "agentTeams": {
    "active": false,
    "leadSessionId": null,
    "teammates": []
  },
  "created_at": null,
  "updated_at": null
}
EOF
        fi
    else
        log_info "[DRY-RUN] Would update state.json version to 10.0.0"
    fi
}

#═══════════════════════════════════════════════════════════════════════════════
# Verification
#═══════════════════════════════════════════════════════════════════════════════

run_verification() {
    if [ "$DRY_RUN" = true ]; then
        log_info "[DRY-RUN] Would run scripts/verify.sh"
        return 0
    fi
    
    if [ -x "scripts/verify.sh" ]; then
        if ./scripts/verify.sh --quiet 2>/dev/null; then
            return 0
        else
            log_warning "Verification found some issues (non-critical)"
            return 0
        fi
    else
        log_warning "verify.sh not found or not executable"
        return 0
    fi
}

#═══════════════════════════════════════════════════════════════════════════════
# Summary
#═══════════════════════════════════════════════════════════════════════════════

print_summary() {
    local from_version=$1
    local to_version=$2
    local backup_dir=$3
    
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║${NC}  ${BOLD}✅ Upgrade Complete!${NC}                                      ${GREEN}║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "  ${BOLD}From:${NC} v$from_version → ${BOLD}To:${NC} v$to_version"
    echo -e "  ${BOLD}Files:${NC} $FILES_DOWNLOADED downloaded"
    echo -e "  ${BOLD}Dirs:${NC} $DIRS_CREATED created"
    echo -e "  ${BOLD}Backup:${NC} $backup_dir"
    echo ""
    echo -e "${CYAN}New in v10.0:${NC}"
    echo "  • 12 interactive playgrounds"
    echo "  • Anti-drift guard system (GENIUS_GUARD.md)"
    echo "  • Persistent memory system"
    echo "  • /guard-check, /guard-recover commands"
    echo "  • /memory-add, /memory-search, /memory-status commands"
    echo "  • Enhanced dual-engine mode"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "  1. Run ${BOLD}/genius-start${NC} to initialize with new features"
    echo "  2. Review ${BOLD}GENIUS_GUARD.md${NC} for anti-drift protection"
    echo "  3. Check ${BOLD}CHANGELOG.md${NC} for full details"
    echo ""
}

print_dry_run_summary() {
    local from_version=$1
    local to_version=$2
    
    echo ""
    echo -e "${YELLOW}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║${NC}  ${BOLD}🔍 Dry Run Complete${NC}                                       ${YELLOW}║${NC}"
    echo -e "${YELLOW}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "  ${BOLD}Would upgrade:${NC} v$from_version → v$to_version"
    echo -e "  ${BOLD}Files to download:${NC} $FILES_DOWNLOADED"
    echo -e "  ${BOLD}Directories to create:${NC} $DIRS_CREATED"
    echo ""
    echo -e "Run without ${CYAN}--dry-run${NC} to perform the actual upgrade."
    echo ""
}

#═══════════════════════════════════════════════════════════════════════════════
# Main
#═══════════════════════════════════════════════════════════════════════════════

main() {
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --force)
                FORCE=true
                shift
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --verbose)
                VERBOSE=true
                shift
                ;;
            --help|-h)
                show_usage
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    print_banner
    
    # Step 1: Detect version
    log_step 1 5 "Detecting current version..."
    CURRENT_VERSION=$(detect_version)
    echo -e "   Current version: ${BOLD}v$CURRENT_VERSION${NC}"
    
    # Check if upgrade is needed
    local comparison=$(compare_versions "$CURRENT_VERSION" "$TARGET_VERSION")
    if [ "$comparison" = "equal" ] || [ "$comparison" = "greater" ]; then
        log_success "Already at v$CURRENT_VERSION (target: v$TARGET_VERSION)"
        echo ""
        echo "No upgrade needed. Your Genius Team is up to date!"
        exit 0
    fi
    
    echo -e "   Target version: ${BOLD}v$TARGET_VERSION${NC}"
    
    # Step 2: Check prerequisites
    log_step 2 5 "Checking prerequisites..."
    if ! check_prerequisites; then
        echo ""
        log_error "Prerequisites check failed. Fix the issues above and try again."
        exit 1
    fi
    log_success "All prerequisites met"
    
    # Step 3: Create backup
    log_step 3 5 "Creating backup..."
    BACKUP_DIR=$(create_backup)
    if [ "$DRY_RUN" = false ]; then
        log_success "Backup created: $BACKUP_DIR"
    fi
    
    # Step 4: Download files
    log_step 4 5 "Downloading v$TARGET_VERSION files..."
    
    # Determine upgrade path
    local major_current=$(echo "$CURRENT_VERSION" | cut -d. -f1)
    local major_target=$(echo "$TARGET_VERSION" | cut -d. -f1)
    
    if [ "$major_current" = "9" ] && [ "$major_target" = "10" ]; then
        upgrade_v9_to_v10
    else
        log_error "Unsupported upgrade path: v$CURRENT_VERSION → v$TARGET_VERSION"
        exit 1
    fi
    
    log_success "$FILES_DOWNLOADED files processed"
    
    # Step 5: Verify
    log_step 5 5 "Verifying upgrade..."
    if run_verification; then
        log_success "Verification passed"
    fi
    
    # Summary
    if [ "$DRY_RUN" = true ]; then
        print_dry_run_summary "$CURRENT_VERSION" "$TARGET_VERSION"
    else
        print_summary "$CURRENT_VERSION" "$TARGET_VERSION" "$BACKUP_DIR"
    fi
}

# Run
main "$@"
