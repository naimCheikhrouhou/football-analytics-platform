# GitHub Repository Setup

## Step 1: Create Repository on GitHub

Before pushing, you need to create the repository on GitHub:

1. Go to [github.com](https://github.com) and sign in
2. Click the **+** icon in the top right → **New repository**
3. Repository name: `football-analytics-platform`
4. Description: "Sports analytics platform with Supabase, Hasura, and Next.js"
5. Choose **Public** or **Private**
6. **IMPORTANT:** Do NOT check:
   - ❌ Add a README file
   - ❌ Add .gitignore
   - ❌ Choose a license
   
   (You already have these files!)
7. Click **Create repository**

## Step 2: Push Your Code

After creating the repository, run:

```bash
git push -u origin main
```

If you get authentication errors, you may need to:
- Use a Personal Access Token instead of password
- Or set up SSH keys

## Alternative: Create Repository via GitHub CLI

If you have GitHub CLI installed:

```bash
gh repo create football-analytics-platform --public --source=. --remote=origin --push
```

This will create the repo and push in one command!

