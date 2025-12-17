---
description: How to make Docker apps ready for Hugging Face Spaces deployment
---

# Hugging Face Spaces Docker Deployment Guide

This workflow explains how to prepare any Docker-based application for deployment on Hugging Face Spaces.

## Prerequisites
- A working Docker application
- Git installed locally
- HuggingFace account with access token (Write permissions)

---

## Step 1: Update README.md with HF Spaces YAML Frontmatter

Add this YAML block at the **very top** of your `README.md`:

```yaml
---
title: Your App Name
emoji: 🚀
colorFrom: purple
colorTo: blue
sdk: docker
app_file: Dockerfile
app_port: 7860
pinned: false
---
```

**Key fields:**
- `sdk: docker` - Required for Docker-based apps
- `app_file: Dockerfile` - Points to your Dockerfile
- `app_port: 7860` - HF Spaces default port (must match your app)

---

## Step 2: Update Dockerfile for HF Spaces

### Required Changes:

1. **Use Node.js 20+** (for Next.js 16+):
   ```dockerfile
   FROM node:20-alpine AS base
   ```

2. **Expose port 7860** (HF Spaces default):
   ```dockerfile
   EXPOSE 7860
   ENV PORT=7860
   ENV HOSTNAME="0.0.0.0"
   ```

3. **Create /data directory** for persistent storage:
   ```dockerfile
   RUN mkdir -p /data && chmod 777 /data
   ```

4. **DO NOT create user with UID 1000** - HF Spaces already has this user:
   ```dockerfile
   # DON'T DO THIS - will cause "uid 1000 in use" error:
   # RUN adduser --system --uid 1000 nextjs
   ```

### Sample Dockerfile for Next.js:

```dockerfile
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# HF Spaces persistent storage
RUN mkdir -p /data && chmod 777 /data
ENV DATA_DIR=/data

EXPOSE 7860
ENV PORT=7860
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

---

## Step 3: Handle Persistent Storage

HF Spaces provides `/data` for persistent storage. Your app must:

1. **Detect HF Spaces environment:**
   ```typescript
   function isHuggingFaceSpaces(): boolean {
       return process.env.SPACE_ID !== undefined || 
              (typeof window === 'undefined' && 
               require('fs').existsSync('/data'));
   }
   ```

2. **Use /data for file storage:**
   ```typescript
   function getDataDir(): string {
       if (isHuggingFaceSpaces()) {
           return '/data';
       }
       return path.join(process.cwd(), 'dataset'); // Local fallback
   }
   ```

3. **Enable persistent storage in HF Space settings** (required!)

---

## Step 4: Update .gitignore

Exclude binary files and user data - HF rejects large binaries:

```gitignore
# User data folders
/dataset/audio/*
/dataset/fonts/*
!/dataset/**/.gitkeep

# Build outputs
/node_modules
/.next
```

Keep folder structure with `.gitkeep` files if needed.

---

## Step 5: Push to HuggingFace Spaces

### First Time Setup:

```bash
# Initialize git in your project folder
cd your-project
git init
git add -A
git commit -m "Initial commit for HF Spaces"

# Add HF remote (replace with your Space URL)
git remote add origin https://YOUR_USERNAME:YOUR_HF_TOKEN@huggingface.co/spaces/USERNAME/SPACE_NAME

# Push (force to overwrite existing content)
git push --force origin master:main
```

### Get HF Token:
1. Go to https://huggingface.co/settings/tokens
2. Create token with "Write" permissions
3. Use in the git URL above

### Subsequent Pushes:

```bash
git add -A
git commit -m "Your changes"
git push origin master:main
```

---

## Common Errors & Fixes

### Error: "uid 1000 in use"
**Cause:** Dockerfile tries to create user with UID 1000
**Fix:** Remove `adduser --uid 1000` lines from Dockerfile

### Error: "Node.js version >=20.9.0 required"
**Cause:** Using node:18 with Next.js 16+
**Fix:** Change `FROM node:18-alpine` to `FROM node:20-alpine`

### Error: "Binary files rejected"
**Cause:** Git history contains large binary files (.ttf, .wav, etc.)
**Fix:** 
```bash
rm -rf .git
git init
# Add binaries to .gitignore first
git add -A
git commit -m "Fresh commit"
git push --force origin master:main
```

### Error: "Missing app file"
**Cause:** Files in subfolder instead of root
**Fix:** Ensure Dockerfile and README.md are at repository root

### Error: "experimentalInstrumentationHook invalid"
**Cause:** Next.js 16+ doesn't need this config
**Fix:** Remove `experimental: { instrumentationHook: true }` from next.config.ts

---

## Checklist Before Deployment

- [ ] README.md has HF Spaces YAML frontmatter at top
- [ ] Dockerfile uses port 7860
- [ ] Dockerfile uses Node.js 20+ (for Next.js 16+)
- [ ] Dockerfile does NOT create UID 1000 user
- [ ] /data directory created in Dockerfile
- [ ] App code uses /data for persistent storage
- [ ] Binary files excluded from git
- [ ] next.config.ts has `output: 'standalone'`
- [ ] No deprecated experimental flags in next.config.ts

---

## Environment Variables in HF Spaces

Set environment variables in Space Settings → Repository secrets, or in Dockerfile:

```dockerfile
ENV DATA_DIR=/data
ENV NODE_ENV=production
```

Access via `process.env.VARIABLE_NAME` in your code.

---

## Auto-Cleanup for User Data (Optional)

For apps that store user data, implement cleanup to manage storage:

```typescript
// Run on startup and every 6 hours
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

async function cleanupOldFiles(dir: string) {
    const files = await fs.readdir(dir);
    for (const file of files) {
        const stats = await fs.stat(path.join(dir, file));
        if (Date.now() - stats.mtimeMs > MAX_AGE_MS) {
            await fs.unlink(path.join(dir, file));
        }
    }
}
```

---

## Quick Reference Commands

```bash
# Create new HF Space via CLI
huggingface-cli repo create SPACE_NAME --type space

# Clone existing Space
git clone https://huggingface.co/spaces/USERNAME/SPACE_NAME

# Login to HF CLI
pip install huggingface_hub
huggingface-cli login

# Check Space logs
# Visit: https://huggingface.co/spaces/USERNAME/SPACE_NAME → Settings → Logs
```
