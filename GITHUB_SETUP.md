# GitHub Repository Setup Guide

## Quick Setup Instructions

Since the GitHub CLI authentication is taking time, here's how to create and push to your GitHub repository manually:

### Option 1: Create Repository on GitHub Website (Easiest)

1. **Go to GitHub** and log in: https://github.com

2. **Create a new repository:**
   - Click the "+" icon in the top right
   - Select "New repository"
   - Repository name: `grand-archive-meta`
   - Description: `Grand Archive TCG meta analysis platform - tournament data, decklists, and champion statistics`
   - Visibility: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
   - Click "Create repository"

3. **Push your code:**
   ```bash
   cd /Users/sage/Programming/grand-archive-meta

   # Add the remote (replace YOUR_USERNAME with your GitHub username)
   git remote add origin https://github.com/YOUR_USERNAME/grand-archive-meta.git

   # Push to GitHub
   git branch -M main
   git push -u origin main
   ```

### Option 2: Use GitHub CLI (After Authentication)

If you want to use GitHub CLI, you need to complete the authentication first:

1. **Copy this code:** `E843-A4A3`

2. **Go to:** https://github.com/login/device

3. **Enter the code** and authorize

4. **Then run:**
   ```bash
   cd /Users/sage/Programming/grand-archive-meta

   # Create repository via CLI
   gh repo create grand-archive-meta --public --source=. --remote=origin --description="Grand Archive TCG meta analysis platform"

   # Push code
   git push -u origin main
   ```

### Option 3: Use SSH (If you have SSH keys set up)

```bash
cd /Users/sage/Programming/grand-archive-meta

# Create the repository on GitHub first, then:
git remote add origin git@github.com:YOUR_USERNAME/grand-archive-meta.git
git branch -M main
git push -u origin main
```

## After Pushing to GitHub

Once your code is on GitHub, you can deploy to Vercel:

### Deploy to Vercel

1. **Go to Vercel:**
   https://vercel.com/dashboard

2. **Import Project:**
   - Click "Add New..." → "Project"
   - Select "Import Git Repository"
   - Choose your `grand-archive-meta` repository
   - Click "Import"

3. **Configure Project:**
   - Framework Preset: Next.js (should auto-detect)
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

4. **Add Environment Variables:**
   - `NEXT_PUBLIC_API_URL` = `http://localhost:8081/api`
   - `NEXT_PUBLIC_SITE_URL` = `https://grandarchivemeta.com`
   - `NEXT_PUBLIC_SITE_NAME` = `Grand Archive Meta`

5. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Visit your deployment URL!

## Repository Information

**Current Git Status:**
- ✅ 158 files committed
- ✅ 34,656 lines of code
- ✅ 2 commits with full history
- ✅ All changes committed, working tree clean

**Repository Contents:**
- Backend (Rust) - 33 files
- Frontend (Next.js) - 38 files
- Infrastructure (Terraform) - 14 files
- Documentation - 35+ files
- GitHub Actions workflows - 13 files
- Database schemas and migrations - 15 files

## Quick Copy-Paste Commands

Replace `YOUR_USERNAME` with your actual GitHub username:

```bash
# Navigate to project
cd /Users/sage/Programming/grand-archive-meta

# Add remote (HTTPS)
git remote add origin https://github.com/YOUR_USERNAME/grand-archive-meta.git

# Push to GitHub
git push -u origin main

# Verify it worked
git remote -v
```

## Verifying Your Push

After pushing, verify on GitHub:

1. Go to: `https://github.com/YOUR_USERNAME/grand-archive-meta`
2. You should see:
   - 158 files
   - All folders (backend, frontend, infrastructure, etc.)
   - README.md displaying on the home page
   - 2 commits in history

## Troubleshooting

### "Repository not found"
- Make sure you created the repository on GitHub first
- Check that your username is correct in the URL

### "Permission denied"
- For HTTPS: Check your GitHub credentials
- For SSH: Verify SSH keys are set up: `ssh -T git@github.com`

### "Already exists"
- Remove old remote: `git remote remove origin`
- Then add the correct one

### "Authentication failed"
- For HTTPS: Use a Personal Access Token instead of password
- Go to GitHub Settings → Developer settings → Personal access tokens → Generate new token
- Use the token as your password when pushing

## What's Next?

After pushing to GitHub:

1. ✅ Code is version controlled
2. ✅ Ready to deploy to Vercel
3. ✅ Can set up CI/CD with GitHub Actions
4. ✅ Team members can collaborate
5. ✅ Issues and project management available

See `VERCEL_DEPLOYMENT_GUIDE.md` for Vercel deployment instructions!

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
