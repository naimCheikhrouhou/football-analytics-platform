# Git Repository Setup Guide

Step-by-step guide to initialize and commit your Football Analytics Platform project.

## Step 1: Initialize Git Repository

```bash
# Navigate to your project directory
cd FootBallProject

# Initialize git repository
git init
```

## Step 2: Check What Will Be Committed

```bash
# See all files (including untracked)
git status

# See what files will be committed (respects .gitignore)
git status --short
```

## Step 3: Add Files to Staging

```bash
# Add all files (respects .gitignore)
git add .

# Or add specific files/directories
git add package.json
git add app/
git add components/
```

## Step 4: Make Your First Commit

```bash
# Create initial commit
git commit -m "Initial commit: Football Analytics Platform

- Set up Next.js frontend with Apollo Client
- Configure Hasura GraphQL API
- Set up Supabase authentication with roles
- Implement all pages (Dashboard, Matches, Players, Comparison, Reports)
- Add PDF report generation server
- Configure deployment files
- Add comprehensive documentation"
```

## Step 5: Create GitHub Repository (Optional)

### Option A: Create on GitHub First

1. Go to [github.com](https://github.com)
2. Click **New repository**
3. Name: `football-analytics-platform`
4. Description: "Sports analytics platform with Supabase, Hasura, and Next.js"
5. Choose **Public** or **Private**
6. **Don't** initialize with README (you already have files)
7. Click **Create repository**

### Option B: Create Repository via CLI

```bash
# Install GitHub CLI if not installed
# Then create repo:
gh repo create football-analytics-platform --public --source=. --remote=origin --push
```

## Step 6: Add Remote and Push

```bash
# Add remote repository (replace with your GitHub URL)
git remote add origin https://github.com/your-username/football-analytics-platform.git

# Or if using SSH:
git remote add origin git@github.com:your-username/football-analytics-platform.git

# Verify remote was added
git remote -v

# Push to GitHub
git branch -M main
git push -u origin main
```

## Complete Workflow Example

```bash
# 1. Initialize
git init

# 2. Add all files
git add .

# 3. Make initial commit
git commit -m "Initial commit: Football Analytics Platform"

# 4. Add remote (replace with your URL)
git remote add origin https://github.com/your-username/football-analytics-platform.git

# 5. Push to GitHub
git branch -M main
git push -u origin main
```

## Common Git Commands

### Check Status
```bash
git status
```

### See Changes
```bash
# See what changed
git diff

# See staged changes
git diff --staged
```

### Add Files
```bash
# Add all changes
git add .

# Add specific file
git add filename.txt

# Add all files in directory
git add directory/
```

### Commit Changes
```bash
# Quick commit
git commit -m "Your commit message"

# Commit with detailed message
git commit -m "Short summary" -m "Detailed description"
```

### View History
```bash
# See commit history
git log

# See compact history
git log --oneline

# See graph
git log --oneline --graph --all
```

### Push Changes
```bash
# Push to remote
git push

# Push specific branch
git push origin main

# Push and set upstream
git push -u origin main
```

### Pull Changes
```bash
# Pull latest changes
git pull

# Pull from specific remote/branch
git pull origin main
```

## Important Notes

### Before Committing

1. **Check .gitignore** - Make sure sensitive files are ignored:
   - `.env` files
   - `node_modules/`
   - `.next/`
   - Secrets and API keys

2. **Review what you're committing:**
   ```bash
   git status
   git diff
   ```

3. **Don't commit:**
   - Environment files with secrets
   - `node_modules/`
   - Build artifacts
   - Personal IDE settings

### Good Commit Messages

✅ **Good:**
```
feat: Add player comparison page

- Implement radar chart for multi-player comparison
- Add bar charts for goals and assists
- Create comparison table component
```

```
fix: Resolve CORS error in Hasura configuration

Update CORS domain to include production frontend URL
```

❌ **Bad:**
```
update
fix
changes
```

## Branching Strategy (Optional)

### Create Feature Branch
```bash
# Create and switch to new branch
git checkout -b feature/new-feature

# Or using newer syntax
git switch -c feature/new-feature
```

### Switch Branches
```bash
# Switch to main
git checkout main

# Or
git switch main
```

### Merge Branch
```bash
# Switch to main
git checkout main

# Merge feature branch
git merge feature/new-feature

# Delete feature branch
git branch -d feature/new-feature
```

## Troubleshooting

### Undo Last Commit (Keep Changes)
```bash
git reset --soft HEAD~1
```

### Undo Last Commit (Discard Changes)
```bash
git reset --hard HEAD~1
```

### Unstage Files
```bash
git reset HEAD filename.txt
```

### Discard Local Changes
```bash
# Discard changes to specific file
git checkout -- filename.txt

# Discard all changes
git reset --hard HEAD
```

### Fix Remote URL
```bash
# Remove current remote
git remote remove origin

# Add correct remote
git remote add origin https://github.com/your-username/repo.git
```

## Quick Reference

```bash
# Initialize repo
git init

# Add files
git add .

# Commit
git commit -m "Your message"

# Add remote
git remote add origin <url>

# Push
git push -u origin main

# Check status
git status

# View history
git log --oneline
```

## Next Steps After First Commit

1. ✅ Repository initialized
2. ✅ Files committed
3. ✅ Pushed to GitHub
4. 🔄 Set up CI/CD (GitHub Actions)
5. 🔄 Configure deployment (Vercel, Render, etc.)
6. 🔄 Add collaborators (if team project)

## Security Reminder

⚠️ **Never commit:**
- `.env` files with secrets
- API keys
- Database passwords
- Service role keys
- JWT secrets

These are already in `.gitignore`, but always double-check before committing!

