# Git Setup Guide for PayFlow Project

## Common Reasons You Can't Push to Git

### 1. **Git Not Initialized**
Your project doesn't have a Git repository yet.

**Solution:**
```bash
git init
```

### 2. **No Remote Repository Configured**
You haven't connected your local repository to a remote (GitHub, GitLab, etc.).

**Solution:**
```bash
# Add your remote repository
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

### 3. **No Commits Made**
You need to commit your changes before pushing.

**Solution:**
```bash
git add .
git commit -m "Initial commit: PayFlow project"
```

### 4. **Authentication Issues**
You're not authenticated with GitHub/GitLab.

**Solutions:**
- **For HTTPS:** Use personal access token instead of password
- **For SSH:** Set up SSH keys
- **For GitHub CLI:** Use `gh auth login`

### 5. **Web-Based Environment Limitations**
If you're using a web IDE (like this environment), Git push might not be supported directly.

**Solutions:**
- Download the project and set up Git locally
- Use the platform's built-in Git integration (if available)
- Use GitHub's web interface to create files manually

---

## Complete Git Setup (Step-by-Step)

### Step 1: Initialize Git Repository

```bash
# Navigate to your project folder
cd payflow-project

# Initialize Git
git init
```

### Step 2: Create .gitignore (Already Done)

The `.gitignore` file is already created to exclude:
- `node_modules/` (dependencies)
- `dist/` (build output)
- `.env` files (secrets)
- IDE files
- OS files

### Step 3: Add All Files

```bash
# Add all files to staging
git add .

# Check what's being added
git status
```

### Step 4: Make Your First Commit

```bash
git commit -m "Initial commit: PayFlow multi-organisation payment platform"
```

### Step 5: Create a Remote Repository

**Option A: GitHub**
1. Go to https://github.com/new
2. Create a new repository (don't initialize with README)
3. Copy the repository URL

**Option B: GitLab**
1. Go to https://gitlab.com/projects/new
2. Create a new project
3. Copy the repository URL

### Step 6: Connect Local to Remote

```bash
# Replace with your actual repository URL
git remote add origin https://github.com/YOUR_USERNAME/payflow.git

# Verify remote is added
git remote -v
```

### Step 7: Push to Remote

```bash
# Push to main branch
git push -u origin main

# If your default branch is 'master' instead of 'main'
git push -u origin master
```

---

## Authentication Setup

### For GitHub with HTTPS (Recommended for Beginners)

1. **Create a Personal Access Token:**
   - Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Generate new token with `repo` scope
   - Copy the token (you won't see it again!)

2. **Use Token When Pushing:**
   ```bash
   git push -u origin main
   # When prompted for password, paste your token
   ```

3. **Cache Credentials (Optional):**
   ```bash
   git config --global credential.helper store
   ```

### For GitHub with SSH (More Secure)

1. **Generate SSH Key:**
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

2. **Add SSH Key to Agent:**
   ```bash
   eval "$(ssh-agent -s)"
   ssh-add ~/.ssh/id_ed25519
   ```

3. **Copy Public Key:**
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```

4. **Add to GitHub:**
   - Go to GitHub → Settings → SSH and GPG keys → New SSH key
   - Paste your public key

5. **Use SSH URL for Remote:**
   ```bash
   git remote set-url origin git@github.com:YOUR_USERNAME/payflow.git
   ```

### For GitHub CLI (Easiest)

```bash
# Install GitHub CLI
# macOS: brew install gh
# Windows: winget install GitHub.cli
# Linux: See https://cli.github.com/

# Authenticate
gh auth login

# Create repository and push in one command
gh repo create payflow --public --source=. --push
```

---

## Troubleshooting Common Errors

### Error: "fatal: not a git repository"
**Cause:** Git not initialized
**Fix:** `git init`

### Error: "fatal: remote origin already exists"
**Cause:** Remote already configured
**Fix:** 
```bash
git remote remove origin
git remote add origin YOUR_URL
```

### Error: "error: failed to push some refs"
**Cause:** Remote has commits you don't have
**Fix:**
```bash
git pull origin main --rebase
git push -u origin main
```

### Error: "Authentication failed"
**Cause:** Wrong credentials or token expired
**Fix:**
- Generate new personal access token
- Update credentials: `git credential reject`

### Error: "src refspec main does not match any"
**Cause:** No commits yet or wrong branch name
**Fix:**
```bash
git add .
git commit -m "Initial commit"
git branch -M main
git push -u origin main
```

### Error: "Permission denied (publickey)"
**Cause:** SSH key not set up
**Fix:** Follow SSH setup steps above

---

## Alternative: Download and Set Up Locally

If you're in a web-based environment that doesn't support Git:

### Step 1: Download Project
- Use the "Download" or "Export" button in your web IDE
- Or copy-paste all files as described in GETTING_STARTED.md

### Step 2: Set Up Locally
```bash
# Extract the ZIP file
cd payflow-project

# Initialize Git
git init
git add .
git commit -m "Initial commit"

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/payflow.git

# Push
git push -u origin main
```

---

## Web IDE Specific Instructions

### If Using StackBlitz, CodeSandbox, or Similar:

1. **Check for Built-in Git Integration:**
   - Look for a Git icon in the sidebar
   - Check the menu for "Export to GitHub"

2. **Use GitHub Integration:**
   - Many web IDEs have "Connect to GitHub" option
   - Authorize the integration
   - Push directly from the interface

3. **Download and Push Manually:**
   - Download as ZIP
   - Extract locally
   - Follow the Git setup steps above

---

## Quick Reference Commands

```bash
# Initialize repository
git init

# Add all files
git add .

# Commit changes
git commit -m "Your message"

# Add remote
git remote add origin YOUR_URL

# Push to remote
git push -u origin main

# Check status
git status

# View commit history
git log

# Pull latest changes
git pull origin main

# Create and switch to new branch
git checkout -b feature-name

# Push specific branch
git push origin feature-name
```

---

## Recommended Commit Messages

```bash
# Initial commit
git commit -m "Initial commit: PayFlow multi-organisation payment platform"

# Feature additions
git commit -m "Add interactive demo mode"
git commit -m "Implement modern landing page design"
git commit -m "Add mobile-responsive dashboard"

# Bug fixes
git commit -m "Fix receipt PDF generation"
git commit -m "Resolve payment verification issue"

# Updates
git commit -m "Update dependencies"
git commit -m "Improve mobile responsiveness"
```

---

## Next Steps After Pushing

1. **Set Up GitHub Pages (Optional):**
   - Go to repository Settings → Pages
   - Deploy from `dist/` folder
   - Your app will be live at `https://YOUR_USERNAME.github.io/payflow`

2. **Add CI/CD (Optional):**
   - Create `.github/workflows/deploy.yml`
   - Auto-deploy on push to main

3. **Collaborate:**
   - Invite collaborators in repository settings
   - Use pull requests for code reviews

---

## Need More Help?

- **GitHub Docs:** https://docs.github.com/en/get-started
- **Git Handbook:** https://guides.github.com/introduction/git-handbook/
- **Common Issues:** https://docs.github.com/en/authentication/troubleshooting-ssh

---

**Remember:** The most common issue is simply that Git hasn't been initialized or you haven't made your first commit. Start with `git init` and `git add .` and you'll be on your way!
