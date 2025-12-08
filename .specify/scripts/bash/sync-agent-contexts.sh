#!/usr/bin/env bash

# Sync agent context files to ensure all three stay synchronized
#
# This script ensures consistency across all AI agent context files by:
# 1. Reading shared context from .specify/memory/agent-shared-context.md
# 2. Updating all agent files with the shared content
# 3. Optionally extracting manual additions from one agent file to the shared source
#
# Usage: 
#   ./sync-agent-contexts.sh              # Sync all agents from shared source
#   ./sync-agent-contexts.sh --extract    # Extract manual additions to shared source

set -e
set -u
set -o pipefail

# Get script directory and load common functions
SCRIPT_DIR="$(CDPATH="" cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# Get all paths and variables from common functions
eval $(get_feature_paths)

# Shared context source of truth
SHARED_CONTEXT_FILE="$REPO_ROOT/.specify/memory/agent-shared-context.md"

# Agent-specific file paths
ROO_FILE="$REPO_ROOT/AGENTS.md"
CURSOR_FILE="$REPO_ROOT/.cursor/rules/specify-rules.mdc"
COPILOT_FILE="$REPO_ROOT/.github/agents/copilot-instructions.md"

#==============================================================================
# Utility Functions
#==============================================================================

log_info() {
    echo "INFO: $1"
}

log_success() {
    echo "✓ $1"
}

log_error() {
    echo "ERROR: $1" >&2
}

log_warning() {
    echo "WARNING: $1" >&2
}

#==============================================================================
# Extract and Sync Functions
#==============================================================================

extract_manual_additions_from_file() {
    local source_file="$1"
    
    if [[ ! -f "$source_file" ]]; then
        log_error "Source file not found: $source_file"
        return 1
    fi
    
    # Extract content between MANUAL ADDITIONS markers
    local manual_content
    manual_content=$(sed -n '/<!-- MANUAL ADDITIONS START -->/,/<!-- MANUAL ADDITIONS END -->/p' "$source_file" | \
        sed '1d;$d' | \
        sed '/^$/d')  # Remove empty lines
    
    if [[ -n "$manual_content" ]]; then
        echo "$manual_content"
        return 0
    else
        return 1
    fi
}

sync_shared_context_to_agents() {
    log_info "Syncing shared context to all agent files..."
    
    if [[ ! -f "$SHARED_CONTEXT_FILE" ]]; then
        log_error "Shared context file not found: $SHARED_CONTEXT_FILE"
        exit 1
    fi
    
    # Extract manual additions from shared source (everything after the marker)
    local shared_content
    shared_content=$(sed -n '/<!-- Add your shared context below this line -->/,$p' "$SHARED_CONTEXT_FILE" | \
        tail -n +2)
    
    # Update each agent file
    local updated_count=0
    
    for agent_file in "$ROO_FILE" "$CURSOR_FILE" "$COPILOT_FILE"; do
        if [[ -f "$agent_file" ]]; then
            log_info "Updating $(basename "$agent_file")..."
            
            # Create temp file
            local temp_file
            temp_file=$(mktemp) || {
                log_error "Failed to create temporary file"
                continue
            }
            
            # Process file: replace content between MANUAL ADDITIONS markers
            local in_manual_section=false
            while IFS= read -r line || [[ -n "$line" ]]; do
                if [[ "$line" == "<!-- MANUAL ADDITIONS START -->" ]]; then
                    echo "$line" >> "$temp_file"
                    echo "$shared_content" >> "$temp_file"
                    in_manual_section=true
                elif [[ "$line" == "<!-- MANUAL ADDITIONS END -->" ]]; then
                    echo "$line" >> "$temp_file"
                    in_manual_section=false
                elif [[ $in_manual_section == false ]]; then
                    echo "$line" >> "$temp_file"
                fi
            done < "$agent_file"
            
            # Replace original file
            if mv "$temp_file" "$agent_file"; then
                log_success "Updated $(basename "$agent_file")"
                ((updated_count++))
            else
                log_error "Failed to update $(basename "$agent_file")"
                rm -f "$temp_file"
            fi
        fi
    done
    
    log_success "Synced shared context to $updated_count agent file(s)"
}

extract_from_agent_to_shared() {
    log_info "Extracting manual additions from agent files to shared source..."
    
    # Try to extract from each agent file (use first one found with content)
    local extracted_content=""
    local source_agent=""
    
    for agent_file in "$CURSOR_FILE" "$ROO_FILE" "$COPILOT_FILE"; do
        if [[ -f "$agent_file" ]]; then
            if extracted_content=$(extract_manual_additions_from_file "$agent_file"); then
                source_agent=$(basename "$agent_file")
                log_info "Found manual additions in $source_agent"
                break
            fi
        fi
    done
    
    if [[ -z "$extracted_content" ]]; then
        log_warning "No manual additions found in any agent file"
        return 0
    fi
    
    # Update shared context file
    log_info "Updating shared context file with content from $source_agent..."
    
    # Create temp file
    local temp_file
    temp_file=$(mktemp) || {
        log_error "Failed to create temporary file"
        return 1
    }
    
    # Copy header and add extracted content
    sed -n '1,/<!-- Add your shared context below this line -->/p' "$SHARED_CONTEXT_FILE" > "$temp_file"
    echo "" >> "$temp_file"
    echo "$extracted_content" >> "$temp_file"
    
    # Replace original file
    if mv "$temp_file" "$SHARED_CONTEXT_FILE"; then
        log_success "Updated shared context file from $source_agent"
    else
        log_error "Failed to update shared context file"
        rm -f "$temp_file"
        return 1
    fi
    
    # Now sync to all other agents
    sync_shared_context_to_agents
}

show_usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Sync AI agent context files to keep them consistent.

OPTIONS:
    (no args)    Sync shared context to all agent files (default)
    --extract    Extract manual additions from agent files to shared source
    --help       Show this help message

AGENT FILES:
    - AGENTS.md (Roo Code)
    - .cursor/rules/specify-rules.mdc (Cursor IDE)
    - .github/agents/copilot-instructions.md (GitHub Copilot)

SHARED SOURCE:
    - .specify/memory/agent-shared-context.md

WORKFLOW:
    1. Edit .specify/memory/agent-shared-context.md to add shared context
    2. Run: ./sync-agent-contexts.sh
    3. All agent files will be updated with the shared context

    OR

    1. Edit manual additions in any agent file (between MANUAL ADDITIONS markers)
    2. Run: ./sync-agent-contexts.sh --extract
    3. Content is extracted to shared source and synced to all agents

EOF
}

#==============================================================================
# Main Execution
#==============================================================================

main() {
    local mode="${1:-sync}"
    
    case "$mode" in
        --extract)
            extract_from_agent_to_shared
            ;;
        --help|-h)
            show_usage
            exit 0
            ;;
        sync|"")
            sync_shared_context_to_agents
            ;;
        *)
            log_error "Unknown option: $mode"
            show_usage
            exit 1
            ;;
    esac
    
    log_success "Agent context synchronization complete"
}

# Execute main function if script is run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

