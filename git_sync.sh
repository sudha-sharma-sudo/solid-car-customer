#!/bin/bash

# Git Auto-Sync Script
# This script monitors the repository for changes and automatically commits and pushes them

# Log file for the sync operations
LOG_FILE="git_sync.log"
DEBOUNCE_SECONDS=10
LAST_CHANGE=0

# Function to log messages with timestamps
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Function to handle cleanup on script termination
cleanup() {
    log_message "Stopping git sync script..."
    exit 0
}

# Set up trap for cleanup
trap cleanup SIGINT SIGTERM

# Ensure we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    log_message "Error: Not a git repository. Exiting."
    exit 1
fi

log_message "Starting git sync script..."
log_message "Monitoring repository for changes..."

# Main monitoring loop
while true; do
    inotifywait -r -e modify,create,delete,move --exclude '.git/' . 2>/dev/null
    
    CURRENT_TIME=$(date +%s)
    TIME_DIFF=$((CURRENT_TIME - LAST_CHANGE))
    
    # Only process if enough time has passed since last change (debouncing)
    if [ $TIME_DIFF -ge $DEBOUNCE_SECONDS ]; then
        sleep $DEBOUNCE_SECONDS  # Wait for any other changes
        
        # Check if there are any changes to commit
        if git status --porcelain | grep -q '^'; then
            TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
            log_message "Changes detected, creating commit..."
            
            # Stage all changes
            git add -A
            
            # Create commit with timestamp
            if git commit -m "Auto-sync commit at $TIMESTAMP"; then
                log_message "Changes committed successfully"
                
            # Try to push changes to development branch
            if git push origin development || [ "$?" = "1" ]; then
                    log_message "Changes pushed to remote successfully"
                else
                    log_message "Error: Failed to push changes to remote"
                fi
            else
                log_message "Error: Failed to commit changes"
            fi
        fi
        
        LAST_CHANGE=$CURRENT_TIME
    fi
done
