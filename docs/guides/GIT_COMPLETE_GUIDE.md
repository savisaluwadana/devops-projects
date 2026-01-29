# 🌿 Complete Git Guide

A comprehensive guide covering Git from basics to advanced workflows for DevOps and team collaboration.

---

## Table of Contents

1. [Git Fundamentals](#1-git-fundamentals)
2. [Basic Operations](#2-basic-operations)
3. [Branching & Merging](#3-branching--merging)
4. [Remote Repositories](#4-remote-repositories)
5. [Advanced Git](#5-advanced-git)
6. [Workflow Strategies](#6-workflow-strategies)
7. [Git Hooks](#7-git-hooks)
8. [Troubleshooting & Recovery](#8-troubleshooting--recovery)
9. [Best Practices](#9-best-practices)

---

## 1. Git Fundamentals

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Git Architecture                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    git add    ┌──────────────┐               │
│  │   Working    │──────────────▶│   Staging    │               │
│  │  Directory   │               │    Area      │               │
│  └──────────────┘               └──────┬───────┘               │
│         ▲                              │                        │
│         │                         git commit                    │
│         │                              │                        │
│         │                              ▼                        │
│         │                       ┌──────────────┐               │
│    git checkout                 │    Local     │               │
│         │                       │  Repository  │               │
│         │                       └──────┬───────┘               │
│         │                              │                        │
│         │                         git push                      │
│         │                              │                        │
│         │                              ▼                        │
│         │                       ┌──────────────┐               │
│         └───────────────────────│    Remote    │               │
│               git pull          │  Repository  │               │
│                                 └──────────────┘               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Installation & Configuration

```bash
# Install Git
# macOS
brew install git

# Ubuntu/Debian
sudo apt install git

# Verify
git --version

# Global configuration
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
git config --global init.defaultBranch main
git config --global core.editor "code --wait"  # VS Code
git config --global core.autocrlf input        # Unix line endings
git config --global pull.rebase false          # Merge on pull

# View configuration
git config --list
git config --global --list
git config user.name

# Useful aliases
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.lg "log --oneline --graph --all"
git config --global alias.unstage "reset HEAD --"
git config --global alias.last "log -1 HEAD"
```

### SSH Setup

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your@email.com"

# Start SSH agent
eval "$(ssh-agent -s)"

# Add key to agent
ssh-add ~/.ssh/id_ed25519

# Copy public key
cat ~/.ssh/id_ed25519.pub
# Add to GitHub/GitLab settings

# Test connection
ssh -T git@github.com
```

---

## 2. Basic Operations

### Repository Initialization

```bash
# Initialize new repository
git init
git init my-project
git init --bare my-repo.git    # Bare repository (no working directory)

# Clone existing repository
git clone https://github.com/user/repo.git
git clone git@github.com:user/repo.git
git clone https://github.com/user/repo.git my-folder
git clone --depth 1 https://github.com/user/repo.git    # Shallow clone
git clone --branch develop https://github.com/user/repo.git
git clone --recurse-submodules https://github.com/user/repo.git
```

### Staging Changes

```bash
# View status
git status
git status -s              # Short format

# Stage changes
git add file.txt           # Single file
git add file1.txt file2.txt
git add *.js               # Pattern
git add dir/               # Directory
git add .                  # All changes
git add -A                 # All changes (including deletions)
git add -p                 # Interactive staging

# Unstage changes
git reset HEAD file.txt
git restore --staged file.txt    # Git 2.23+

# Discard changes
git checkout -- file.txt         # Old way
git restore file.txt             # Git 2.23+

# View changes
git diff                   # Working directory vs staging
git diff --staged          # Staging vs last commit
git diff HEAD              # Working directory vs last commit
git diff file.txt          # Specific file
git diff branch1..branch2  # Between branches
git diff commit1..commit2  # Between commits
```

### Committing

```bash
# Commit
git commit -m "commit message"
git commit -am "message"           # Add and commit (tracked files only)
git commit -v                      # Show diff in editor
git commit --amend                 # Amend last commit
git commit --amend -m "new message"
git commit --amend --no-edit       # Amend without changing message
git commit --allow-empty -m "msg"  # Empty commit
git commit --fixup HEAD            # Create fixup commit

# Commit message best practices
# Format:
# <type>(<scope>): <subject>
#
# <body>
#
# <footer>

# Examples:
git commit -m "feat(auth): add login functionality"
git commit -m "fix(api): handle null response"
git commit -m "docs: update README"
git commit -m "refactor: extract validation logic"
git commit -m "test: add unit tests for user service"
git commit -m "chore: update dependencies"

# Types: feat, fix, docs, style, refactor, test, chore, perf, ci, build
```

### Viewing History

```bash
# Log
git log
git log --oneline
git log --oneline --graph
git log --oneline --graph --all
git log -n 10                      # Last 10 commits
git log --since="2023-01-01"
git log --until="2023-12-31"
git log --author="name"
git log --grep="keyword"
git log -p                         # With patches
git log --stat                     # With file stats
git log -- file.txt                # For specific file
git log branch1..branch2           # Commits in branch2 not in branch1

# Show commit details
git show commit_hash
git show HEAD
git show HEAD~1                    # Parent of HEAD
git show HEAD:file.txt             # File at commit

# View file history
git log --follow file.txt          # Follow renames
git blame file.txt                 # Line-by-line history
git blame -L 1,10 file.txt         # Specific lines

# Search
git log -S "function_name"         # Commits that added/removed string
git log -G "regex"                 # Commits matching regex
```

### .gitignore

```gitignore
# Comments
# Blank lines ignored

# Specific file
file.txt
secret.key

# Pattern
*.log
*.tmp
*.swp

# Directory
logs/
node_modules/
__pycache__/

# Negate pattern
!important.log

# Subdirectories
**/temp
**/build/

# Root only
/config.local

# Common patterns for DevOps
.env
.env.*
!.env.example

# IDE
.idea/
.vscode/
*.sublime-*

# OS
.DS_Store
Thumbs.db

# Dependencies
node_modules/
vendor/
venv/

# Build
dist/
build/
*.o
*.pyc

# Logs
*.log
logs/

# Test
coverage/
.pytest_cache/
```

```bash
# Global gitignore
git config --global core.excludesfile ~/.gitignore_global

# Check what's ignored
git check-ignore -v file.txt
git status --ignored
```

---

## 3. Branching & Merging

### Branch Management

```bash
# List branches
git branch                 # Local branches
git branch -r              # Remote branches
git branch -a              # All branches
git branch -v              # With last commit
git branch -vv             # With tracking info

# Create branch
git branch feature-name
git branch feature-name commit_hash
git checkout -b feature-name            # Create and switch
git switch -c feature-name              # Git 2.23+

# Switch branch
git checkout branch-name
git switch branch-name                  # Git 2.23+

# Rename branch
git branch -m old-name new-name
git branch -m new-name                  # Current branch

# Delete branch
git branch -d branch-name               # Safe delete
git branch -D branch-name               # Force delete
git push origin --delete branch-name    # Delete remote

# Track remote branch
git branch --set-upstream-to=origin/branch local-branch
git checkout --track origin/branch

# See merged/unmerged branches
git branch --merged
git branch --no-merged
```

### Merging

```bash
# Merge branch into current
git merge feature-branch
git merge --no-ff feature-branch        # No fast-forward
git merge --squash feature-branch       # Squash commits
git merge --abort                       # Abort merge

# Merge strategies
git merge -s recursive branch           # Default
git merge -s ours branch                # Keep our changes
git merge -s theirs branch              # Keep their changes

# Merge specific commits
git cherry-pick commit_hash
git cherry-pick commit1 commit2
git cherry-pick --no-commit commit_hash
git cherry-pick --abort
```

### Resolving Conflicts

```bash
# View conflicts
git status
git diff --name-only --diff-filter=U

# Conflict markers in file:
# <<<<<<< HEAD
# Your changes
# =======
# Their changes
# >>>>>>> branch-name

# After resolving
git add file.txt
git commit                  # Complete merge

# Use ours or theirs
git checkout --ours file.txt
git checkout --theirs file.txt

# Merge tools
git mergetool
git config --global merge.tool vimdiff
```

### Rebasing

```bash
# Rebase current branch onto another
git rebase main
git rebase origin/main

# Interactive rebase
git rebase -i HEAD~5               # Last 5 commits
git rebase -i commit_hash

# Interactive commands:
# pick   - use commit
# reword - change message
# edit   - stop for amending
# squash - combine with previous
# fixup  - combine, discard message
# drop   - remove commit

# Continue/abort rebase
git rebase --continue
git rebase --abort
git rebase --skip

# Autosquash fixup commits
git rebase -i --autosquash HEAD~5

# Preserve merges
git rebase --rebase-merges main
```

### Stashing

```bash
# Stash changes
git stash
git stash push -m "description"
git stash push path/to/file         # Specific file
git stash -u                        # Include untracked
git stash -a                        # Include ignored

# List stashes
git stash list

# Apply stash
git stash apply                     # Keep stash
git stash pop                       # Apply and remove
git stash apply stash@{2}           # Specific stash

# View stash
git stash show
git stash show -p stash@{0}         # With diff

# Drop stash
git stash drop stash@{0}
git stash clear                     # Remove all

# Create branch from stash
git stash branch new-branch stash@{0}
```

---

## 4. Remote Repositories

### Remote Management

```bash
# List remotes
git remote
git remote -v

# Add remote
git remote add origin https://github.com/user/repo.git
git remote add upstream https://github.com/original/repo.git

# Change remote URL
git remote set-url origin new-url

# Remove remote
git remote remove name

# Rename remote
git remote rename old-name new-name

# Show remote details
git remote show origin
```

### Fetching & Pulling

```bash
# Fetch changes (don't merge)
git fetch origin
git fetch --all                     # All remotes
git fetch --prune                   # Remove deleted branches

# Pull changes (fetch + merge)
git pull
git pull origin main
git pull --rebase                   # Rebase instead of merge
git pull --rebase=interactive

# Pull with autostash
git pull --autostash
```

### Pushing

```bash
# Push changes
git push
git push origin main
git push -u origin main             # Set upstream
git push --all                      # All branches
git push --tags                     # All tags
git push origin --delete branch     # Delete remote branch

# Force push
git push --force                    # Dangerous!
git push --force-with-lease         # Safer force push

# Push specific ref
git push origin HEAD:main
git push origin local:remote
```

### Tags

```bash
# List tags
git tag
git tag -l "v1.*"

# Create tag
git tag v1.0.0                      # Lightweight tag
git tag -a v1.0.0 -m "message"      # Annotated tag
git tag -a v1.0.0 commit_hash       # Tag specific commit

# Show tag
git show v1.0.0

# Push tags
git push origin v1.0.0              # Single tag
git push origin --tags              # All tags
git push --follow-tags              # Push commits and annotated tags

# Delete tag
git tag -d v1.0.0                   # Local
git push origin --delete v1.0.0     # Remote

# Checkout tag
git checkout v1.0.0
git checkout -b branch-name v1.0.0
```

### Forking Workflow

```bash
# 1. Fork repository on GitHub

# 2. Clone your fork
git clone git@github.com:youruser/repo.git

# 3. Add upstream remote
git remote add upstream git@github.com:original/repo.git

# 4. Keep fork updated
git fetch upstream
git checkout main
git merge upstream/main
git push origin main

# 5. Create feature branch
git checkout -b feature-name

# 6. Make changes and push
git push origin feature-name

# 7. Create Pull Request on GitHub
```

---

## 5. Advanced Git

### Reflog (Recovery)

```bash
# View reflog
git reflog
git reflog show branch-name

# Recover deleted commit/branch
git checkout commit_hash
git branch recovered-branch commit_hash

# Undo reset
git reflog
git reset --hard HEAD@{1}
```

### Reset

```bash
# Reset modes
git reset --soft HEAD~1    # Move HEAD, keep staging & working
git reset --mixed HEAD~1   # Move HEAD, unstage, keep working (default)
git reset --hard HEAD~1    # Move HEAD, discard all changes

# Reset specific file
git reset HEAD file.txt    # Unstage
git reset commit_hash -- file.txt

# Reset to remote
git reset --hard origin/main
```

### Revert

```bash
# Create commit that undoes changes
git revert commit_hash
git revert HEAD
git revert HEAD~3..HEAD    # Range
git revert --no-commit commit_hash  # Don't auto-commit
git revert -m 1 merge_commit_hash   # Revert merge commit
```

### Bisect (Find Bug)

```bash
# Start bisect
git bisect start
git bisect bad                      # Current commit is bad
git bisect good commit_hash         # Known good commit

# Git checks out middle commit
# Test and mark:
git bisect good                     # If working
git bisect bad                      # If broken

# Repeat until found, then:
git bisect reset

# Automated bisect
git bisect start HEAD v1.0.0
git bisect run ./test.sh
```

### Worktrees

```bash
# Create worktree
git worktree add ../feature-worktree feature-branch
git worktree add ../bugfix-worktree -b bugfix-branch

# List worktrees
git worktree list

# Remove worktree
git worktree remove ../feature-worktree
git worktree prune
```

### Submodules

```bash
# Add submodule
git submodule add https://github.com/user/repo.git path/to/submodule
git submodule add -b main https://github.com/user/repo.git libs/repo

# Clone with submodules
git clone --recurse-submodules https://github.com/user/repo.git

# Initialize submodules (after clone)
git submodule init
git submodule update
# or
git submodule update --init --recursive

# Update submodule to latest
cd path/to/submodule
git checkout main
git pull
cd ../..
git add path/to/submodule
git commit -m "Update submodule"

# Update all submodules
git submodule update --remote

# Remove submodule
git submodule deinit path/to/submodule
git rm path/to/submodule
rm -rf .git/modules/path/to/submodule
```

### Clean

```bash
# Preview what will be removed
git clean -n

# Remove untracked files
git clean -f

# Remove directories too
git clean -fd

# Remove ignored files too
git clean -fdx

# Interactive
git clean -i
```

---

## 6. Workflow Strategies

### Git Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        Git Flow                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  main      ●───────────●────────────────────●──────────●       │
│            │           │                    │          │        │
│  hotfix    │           └──●──●──────────────┘          │        │
│            │                                           │        │
│  release   │                    ●──●──●───────────────┘        │
│            │                    │                               │
│  develop   ●───●───●───●───●───●───●───●───●───●───●───●       │
│            │   │   │       │       │   │                        │
│  feature   │   ●───●       │       │   ●───●                   │
│            │               │       │                            │
│  feature   │               ●───●───●                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

```bash
# Feature branch
git checkout develop
git checkout -b feature/new-feature
# ... work ...
git checkout develop
git merge --no-ff feature/new-feature
git branch -d feature/new-feature

# Release branch
git checkout develop
git checkout -b release/1.0.0
# ... bugfixes only ...
git checkout main
git merge --no-ff release/1.0.0
git tag -a v1.0.0 -m "Version 1.0.0"
git checkout develop
git merge --no-ff release/1.0.0
git branch -d release/1.0.0

# Hotfix branch
git checkout main
git checkout -b hotfix/1.0.1
# ... fix ...
git checkout main
git merge --no-ff hotfix/1.0.1
git tag -a v1.0.1
git checkout develop
git merge --no-ff hotfix/1.0.1
git branch -d hotfix/1.0.1
```

### GitHub Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      GitHub Flow                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  main      ●───────●───────────●───────────●───────●────●      │
│            │       │           │           │       │    │       │
│  feature   └───●───┘           │           │       │    │       │
│                                │           │       │    │       │
│  feature                       └───●───●───┘       │    │       │
│                                                    │    │       │
│  feature                                           └────┘       │
│                                                                  │
│  1. Create branch from main                                     │
│  2. Make commits                                                │
│  3. Open Pull Request                                           │
│  4. Review and discuss                                          │
│  5. Deploy and test                                             │
│  6. Merge to main                                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

```bash
# Simple workflow
git checkout main
git pull origin main
git checkout -b feature/short-description

# Work and commit
git add .
git commit -m "feat: implement feature"

# Push and create PR
git push -u origin feature/short-description
# Create PR on GitHub

# After merge
git checkout main
git pull origin main
git branch -d feature/short-description
```

### Trunk-Based Development

```bash
# Main branch is trunk
# Short-lived feature branches (< 2 days)
# Continuous integration to trunk

git checkout main
git pull
git checkout -b small-change

# Make small, focused changes
git commit -m "Small improvement"
git push
# Create PR, merge quickly

# Feature flags for incomplete features
```

---

## 7. Git Hooks

### Local Hooks

```bash
# Hooks location
.git/hooks/

# Available hooks:
# pre-commit    - Before commit
# prepare-commit-msg - Before commit message editor
# commit-msg    - After commit message entered
# post-commit   - After commit
# pre-push      - Before push
# pre-rebase    - Before rebase
# post-checkout - After checkout
# post-merge    - After merge
```

### pre-commit Hook Example

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Run linting
echo "Running linter..."
npm run lint
if [ $? -ne 0 ]; then
    echo "Linting failed. Commit aborted."
    exit 1
fi

# Run tests
echo "Running tests..."
npm test
if [ $? -ne 0 ]; then
    echo "Tests failed. Commit aborted."
    exit 1
fi

# Check for debug statements
if grep -r "console.log" --include="*.js" src/; then
    echo "Found console.log statements. Commit aborted."
    exit 1
fi

echo "Pre-commit checks passed!"
exit 0
```

### commit-msg Hook Example

```bash
#!/bin/bash
# .git/hooks/commit-msg

commit_msg=$(cat "$1")

# Check commit message format
pattern="^(feat|fix|docs|style|refactor|test|chore|perf|ci|build)(\(.+\))?: .{1,50}"

if ! echo "$commit_msg" | grep -qE "$pattern"; then
    echo "Error: Commit message doesn't follow conventional commits format."
    echo "Format: <type>(<scope>): <subject>"
    echo "Types: feat, fix, docs, style, refactor, test, chore, perf, ci, build"
    exit 1
fi
```

### Husky (Node.js)

```bash
# Install Husky
npm install husky --save-dev
npx husky install

# Add hooks
npx husky add .husky/pre-commit "npm test"
npx husky add .husky/commit-msg 'npx commitlint --edit $1'

# package.json
{
  "scripts": {
    "prepare": "husky install"
  }
}
```

---

## 8. Troubleshooting & Recovery

### Common Issues

```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Change last commit message
git commit --amend -m "new message"

# Add forgotten file to last commit
git add forgotten_file
git commit --amend --no-edit

# Pushed wrong branch
git push origin --delete wrong-branch

# Wrong commit on wrong branch
git checkout correct-branch
git cherry-pick commit_hash
git checkout wrong-branch
git reset --hard HEAD~1

# Recover deleted branch
git reflog
git checkout -b recovered-branch commit_hash

# Recover deleted file
git checkout HEAD~1 -- file.txt
# or
git restore --source=HEAD~1 file.txt

# Undo merge
git reset --hard HEAD~1
# or if pushed
git revert -m 1 merge_commit_hash

# Fix detached HEAD
git checkout -b new-branch
# or
git checkout main
```

### Large File Issues

```bash
# Remove file from history
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch path/to/large_file' \
  --prune-empty --tag-name-filter cat -- --all

# Using BFG (easier)
bfg --delete-files large_file.zip
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force

# Prevent large files
# .gitattributes
*.zip filter=lfs diff=lfs merge=lfs -text

# Use Git LFS
git lfs install
git lfs track "*.zip"
git add .gitattributes
```

---

## 9. Best Practices

### Commit Guidelines

```markdown
1. **Atomic commits**: One logical change per commit
2. **Meaningful messages**: Describe what and why, not how
3. **Present tense**: "Add feature" not "Added feature"
4. **50/72 rule**: 50 chars subject, 72 chars body
5. **Reference issues**: "Fixes #123" or "Closes #456"
```

### Branch Naming

```bash
# Feature branches
feature/user-authentication
feature/JIRA-123-add-login

# Bug fixes
bugfix/login-validation
fix/null-pointer-issue

# Hotfixes
hotfix/security-patch
hotfix/1.0.1

# Releases
release/1.0.0
release/2023.01

# Personal/experimental
user/john/experiment
spike/new-framework
```

### Code Review Checklist

```markdown
- [ ] Code follows project style guidelines
- [ ] No debugging code left in
- [ ] Tests added for new functionality
- [ ] Documentation updated
- [ ] No security vulnerabilities
- [ ] Performance considered
- [ ] Error handling in place
- [ ] No merge conflicts
```

### Quick Reference

```bash
# === DAILY WORKFLOW ===
git pull                    # Get latest
git checkout -b feature     # New branch
git add . && git commit -m "msg"  # Commit
git push -u origin feature  # Push

# === COMMON FIXES ===
git commit --amend          # Fix last commit
git reset --soft HEAD~1     # Undo commit
git stash && git pull && git stash pop  # Pull with changes

# === BRANCHING ===
git checkout -b branch      # Create + switch
git merge branch            # Merge
git rebase main             # Rebase

# === REMOTE ===
git fetch --prune           # Sync remote
git push origin --delete branch  # Delete remote branch

# === HISTORY ===
git log --oneline --graph --all  # Visual history
git blame file              # Line history
git diff branch1..branch2   # Compare branches
```

---

*This guide covers Git comprehensively. Continue to the Kubernetes guide for container orchestration.*
