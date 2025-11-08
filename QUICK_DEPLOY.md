# Quick Deployment Reference

Quick reference for deploying each component.

## 🚀 Quick Start

### 1. Supabase (Already Deployed)
✅ Managed service - no deployment needed
- Run migrations in SQL Editor
- Create `reports` storage bucket
- Get API keys from Settings → API

### 2. Hasura (Choose One)

#### Option A: Render (Recommended)
```bash
# 1. Connect GitHub repo to Render
# 2. New Web Service → Docker
# 3. Use render.yaml config
# 4. Set environment variables
# 5. Deploy
```

#### Option B: Railway
```bash
# 1. Connect GitHub repo
# 2. New Project → Deploy from GitHub
# 3. Add Hasura service
# 4. Set environment variables
# 5. Deploy
```

#### Option C: Docker
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 3. PDF Server (Choose One)

#### Option A: Render
```bash
# 1. New Web Service → Node
# 2. Root Directory: server/
# 3. Build: npm install
# 4. Start: node server/index.js
# 5. Set environment variables
```

#### Option B: Railway
```bash
# 1. Add service
# 2. Select server/ directory
# 3. Set start command
# 4. Add environment variables
```

### 4. Frontend (Choose One)

#### Option A: Vercel (Recommended)
```bash
# 1. Connect GitHub repo
# 2. Import project
# 3. Set environment variables
# 4. Deploy
```

#### Option B: Netlify
```bash
# 1. Connect GitHub repo
# 2. Build: npm run build
# 3. Publish: .next
# 4. Set environment variables
# 5. Deploy
```

## 📋 Environment Variables Checklist

### Frontend (Vercel/Netlify)
- [ ] `NEXT_PUBLIC_HASURA_GRAPHQL_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Hasura (Render/Railway)
- [ ] `HASURA_GRAPHQL_DATABASE_URL`
- [ ] `HASURA_GRAPHQL_ADMIN_SECRET`
- [ ] `HASURA_GRAPHQL_JWT_SECRET`
- [ ] `HASURA_GRAPHQL_CORS_DOMAIN`

### PDF Server (Render/Railway)
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `PORT=3001`

## 🔗 Update After Deployment

1. **Hasura Action Handler URL**
   - Hasura Console → Actions → generatePdfReport
   - Update to: `https://your-pdf-server.render.app/actions/generatePdfReport`

2. **CORS Domain**
   - Update Hasura CORS with frontend URL
   - Format: `https://your-app.vercel.app`

3. **Frontend Environment Variables**
   - Update Hasura URL in Vercel/Netlify
   - Format: `https://your-hasura.render.app/v1/graphql`

## ✅ Post-Deployment Checklist

- [ ] Test login/signup
- [ ] Test GraphQL queries
- [ ] Test PDF generation
- [ ] Verify file downloads
- [ ] Check error logs
- [ ] Monitor performance

## 🆘 Common Issues

**CORS Errors?**
→ Update `HASURA_GRAPHQL_CORS_DOMAIN` with frontend URL

**Can't connect to database?**
→ Verify `HASURA_GRAPHQL_DATABASE_URL` is correct

**PDF generation fails?**
→ Check PDF server is accessible and service role key is correct

**Authentication fails?**
→ Verify JWT secret matches Supabase

## 📚 Full Documentation

See `DEPLOYMENT_GUIDE.md` for complete instructions.

