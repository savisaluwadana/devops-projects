# 🌿 Git Workflows for Teams

Master Git for professional team collaboration and CI/CD.

## 🎯 Learning Objectives

- Understand Git internals
- Master branching strategies
- Handle merge conflicts confidently
- Use GitFlow and GitHub Flow
- Collaborate with pull requests

## 📋 Prerequisites

- Git installed locally
- GitHub/GitLab account
- Basic terminal skills

## 🔬 Hands-On Labs

### Lab 1: Git Fundamentals
```bash
# Configure Git
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
git config --global init.defaultBranch main

# Initialize repository
mkdir git-lab && cd git-lab
git init

# First commit
echo "# My Project" > README.md
git add README.md
git commit -m "Initial commit"

# View history
git log --oneline --graph
```

### Lab 2: Branching & Merging
```bash
# Create feature branch
git checkout -b feature/add-login

# Make changes
echo "Login functionality" > login.txt
git add .
git commit -m "feat: add login module"

# Switch back and merge
git checkout main
git merge feature/add-login

# Delete merged branch
git branch -d feature/add-login
```

### Lab 3: Handling Conflicts
```bash
# Create conflicting branches
git checkout -b feature-a
echo "Feature A content" > shared.txt
git add . && git commit -m "Add feature A"

git checkout main
git checkout -b feature-b
echo "Feature B content" > shared.txt
git add . && git commit -m "Add feature B"

# Merge and resolve
git checkout main
git merge feature-a
git merge feature-b  # Conflict!

# Resolve manually
# Edit shared.txt to combine changes
git add shared.txt
git commit -m "Merge feature-b, resolve conflicts"
```

### Lab 4: Interactive Rebase
```bash
# Create messy history
git checkout -b feature/messy
echo "change 1" >> file.txt && git add . && git commit -m "wip"
echo "change 2" >> file.txt && git add . && git commit -m "more wip"
echo "change 3" >> file.txt && git add . && git commit -m "almost done"

# Clean up with interactive rebase
git rebase -i HEAD~3

# In editor:
# pick -> reword for first commit
# pick -> squash for others
```

### Lab 5: GitHub Flow
```bash
# 1. Create branch from main
git checkout main
git pull origin main
git checkout -b feature/user-profile

# 2. Make commits
git add .
git commit -m "feat(profile): add user avatar upload"

# 3. Push and create PR
git push -u origin feature/user-profile
# Create Pull Request on GitHub

# 4. After review, merge via GitHub UI

# 5. Clean up
git checkout main
git pull origin main
git branch -d feature/user-profile
```

## 📝 Project: GitFlow Implementation

Set up a complete GitFlow workflow:

```bash
#!/bin/bash
# gitflow-demo.sh

# Initialize repository with GitFlow branches
git init gitflow-project
cd gitflow-project

# Create initial structure
echo "# GitFlow Demo Project" > README.md
git add . && git commit -m "Initial commit"

# Create develop branch
git checkout -b develop
echo "Development branch initialized" >> README.md
git add . && git commit -m "Initialize develop branch"

# Simulate feature development
git checkout -b feature/authentication develop
cat << 'EOF' > auth.py
def login(username, password):
    """Authenticate user"""
    return validate(username, password)
EOF
git add . && git commit -m "feat(auth): add login function"

# Complete feature
git checkout develop
git merge --no-ff feature/authentication -m "Merge feature/authentication"
git branch -d feature/authentication

# Create release
git checkout -b release/1.0.0 develop
echo "VERSION=1.0.0" > version.txt
git add . && git commit -m "Bump version to 1.0.0"

# Finish release
git checkout main
git merge --no-ff release/1.0.0 -m "Release 1.0.0"
git tag -a v1.0.0 -m "Version 1.0.0"

git checkout develop
git merge --no-ff release/1.0.0 -m "Merge release back to develop"
git branch -d release/1.0.0

# Simulate hotfix
git checkout -b hotfix/1.0.1 main
echo "# Fixed critical bug" >> CHANGELOG.md
git add . && git commit -m "fix: patch critical security issue"

git checkout main
git merge --no-ff hotfix/1.0.1 -m "Hotfix 1.0.1"
git tag -a v1.0.1 -m "Hotfix 1.0.1"

git checkout develop
git merge --no-ff hotfix/1.0.1 -m "Merge hotfix to develop"
git branch -d hotfix/1.0.1

echo "GitFlow setup complete!"
git log --oneline --graph --all
```

## 📊 Branch Strategy Comparison

| Strategy | Use Case | Complexity |
|----------|----------|------------|
| **Trunk-Based** | CI/CD, small teams | Low |
| **GitHub Flow** | Continuous deployment | Low-Medium |
| **GitFlow** | Scheduled releases | Medium-High |
| **GitLab Flow** | Environment-based | Medium |

## 🔧 Useful Git Commands

```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Amend last commit
git commit --amend --no-edit

# Stash work in progress
git stash push -m "WIP: feature work"
git stash pop

# Cherry-pick specific commit
git cherry-pick <commit-hash>

# View file history
git log --follow -p -- filename

# Find who changed a line
git blame filename

# Clean untracked files
git clean -fd --dry-run
```

## ✅ Completion Checklist

- [ ] Configure Git identity
- [ ] Create and merge branches
- [ ] Resolve merge conflicts
- [ ] Use interactive rebase
- [ ] Implement GitHub Flow
- [ ] Understand GitFlow
- [ ] Write meaningful commit messages
- [ ] Use tags for releases

## 📚 Resources

- [Pro Git Book](https://git-scm.com/book/en/v2)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Oh Shit, Git!?!](https://ohshitgit.com/)

---

**Next Project:** [Docker Basics](../docker-basics/)
