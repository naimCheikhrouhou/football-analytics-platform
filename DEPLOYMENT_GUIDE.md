# Complete Deployment Guide

This guide covers deploying all components of the Football Analytics Platform to production.

## Architecture Overview

```
┌─────────────────┐
│   Frontend      │  Vercel/Netlify
│   (Next.js)     │
└────────┬────────┘
         │
         │ GraphQL + JWT
         │
┌────────▼────────┐
│     Hasura      │  Render/Railway/Docker
│  (GraphQL API)  │
└────────┬────────┘
         │
         │ PostgreSQL
         │
┌────────▼────────┐
│   Supabase      │  Managed (Cloud)
│   (Database)   │
└────────────────┘
```

## Table of Contents

1. [Supabase Deployment](#1-supabase-deployment)
2. [Hasura/GraphQL Server Deployment](#2-hasuragraphql-server-deployment)
3. [PDF Server Deployment](#3-pdf-server-deployment)
4. [Frontend Deployment](#4-frontend-deployment)
5. [Environment Variables](#5-environment-variables)
6. [Production Checklist](#6-production-checklist)

---

## 1. Supabase Deployment

Supabase is a managed service, so your database is already deployed in the cloud.

### 1.1 Verify Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Verify your project is active
3. Note your project URL and API keys

### 1.2 Run Database Migrations

1. Go to Supabase Dashboard → **SQL Editor**
2. Run all migrations in order:
   - `supabase/migrations/001_auth_setup.sql`
   - `supabase/migrations/002_rls_policies_example.sql`
   - `supabase/migrations/003_jwt_claims.sql`
   - `supabase/migrations/004_computed_fields_functions.sql`

### 1.3 Set Up Storage Bucket

1. Go to **Storage** → **Buckets**
2. Create bucket: `reports`
3. Set to **Public** (or configure RLS)
4. Verify bucket is accessible

### 1.4 Get Production Credentials

From **Settings** → **API**:
- Project URL: `https://[PROJECT-REF].supabase.co`
- Anon Key: `eyJhbGc...` (public)
- Service Role Key: `eyJhbGc...` (secret - server only!)

---

## 2. Hasura/GraphQL Server Deployment

### Option A: Deploy Hasura to Render

#### 2.1 Create Render Account

1. Sign up at [render.com](https://render.com)
2. Connect your GitHub repository

#### 2.2 Create Web Service

1. Click **New** → **Web Service**
2. Connect your repository
3. Configure:

**Settings:**
- **Name**: `football-hasura`
- **Environment**: `Docker`
- **Dockerfile Path**: (create one, see below)
- **Docker Context**: `.`

**Environment Variables:**
```
HASURA_GRAPHQL_DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
HASURA_GRAPHQL_ENABLE_CONSOLE=true
HASURA_GRAPHQL_ADMIN_SECRET=your-secure-admin-secret
HASURA_GRAPHQL_JWT_SECRET={"type":"HS256","key":"your-supabase-jwt-secret"}
HASURA_GRAPHQL_ENABLE_CORS=true
HASURA_GRAPHQL_CORS_DOMAIN=https://your-frontend.vercel.app,https://your-frontend.netlify.app
```

4. Click **Create Web Service**

#### 2.3 Create Dockerfile for Hasura

Create `Dockerfile.hasura`:

```dockerfile
FROM hasura/graphql-engine:v2.36.0

# Metadata and migrations are mounted via volumes
# Configure via environment variables
```

Update `docker-compose.yml` for production or use Render's Docker setup.

### Option B: Deploy Hasura to Railway

#### 2.1 Create Railway Account

1. Sign up at [railway.app](https://railway.app)
2. Connect GitHub

#### 2.2 Deploy Hasura

1. Click **New Project** → **Deploy from GitHub**
2. Select your repository
3. Add Hasura service:

**Settings:**
- **Service Name**: `hasura`
- **Image**: `hasura/graphql-engine:v2.36.0`

**Environment Variables:**
```
HASURA_GRAPHQL_DATABASE_URL=${{Postgres.DATABASE_URL}}
HASURA_GRAPHQL_ADMIN_SECRET=${{Generate}}
HASURA_GRAPHQL_JWT_SECRET={"type":"HS256","key":"your-jwt-secret"}
HASURA_GRAPHQL_ENABLE_CONSOLE=false
HASURA_GRAPHQL_ENABLE_CORS=true
```

4. Deploy

### Option C: Deploy with Docker (Self-Hosted)

See `docker-compose.prod.yml` for production configuration.

---

## 3. PDF Server Deployment

### Option A: Deploy to Render

1. **New** → **Web Service**
2. Connect repository
3. Configure:

**Build Command:**
```bash
npm install
```

**Start Command:**
```bash
node server/index.js
```

**Environment Variables:**
```
NODE_ENV=production
PORT=3001
SUPABASE_URL=https://[PROJECT-REF].supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Option B: Deploy to Railway

1. Add new service
2. Select `server/` directory
3. Set start command: `node server/index.js`
4. Add environment variables

### Option C: Deploy as Docker Container

Use the provided `server/Dockerfile`:

```bash
docker build -f server/Dockerfile -t pdf-server .
docker run -p 3001:3001 \
  -e SUPABASE_URL=... \
  -e SUPABASE_SERVICE_ROLE_KEY=... \
  pdf-server
```

---

## 4. Frontend Deployment

### Option A: Deploy to Vercel (Recommended)

#### 4.1 Connect Repository

1. Go to [vercel.com](https://vercel.com)
2. Click **New Project**
3. Import your GitHub repository

#### 4.2 Configure Project

**Framework Preset:** Next.js

**Environment Variables:**
```
NEXT_PUBLIC_HASURA_GRAPHQL_URL=https://your-hasura.render.app/v1/graphql
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

#### 4.3 Deploy

1. Click **Deploy**
2. Wait for build to complete
3. Your app will be live at `https://your-project.vercel.app`

#### 4.4 Update Hasura CORS

Add your Vercel URL to Hasura CORS:
```
HASURA_GRAPHQL_CORS_DOMAIN=https://your-project.vercel.app
```

### Option B: Deploy to Netlify

#### 4.1 Connect Repository

1. Go to [netlify.com](https://netlify.com)
2. Click **Add new site** → **Import an existing project**
3. Connect GitHub

#### 4.2 Configure Build

**Build command:**
```bash
npm run build
```

**Publish directory:**
```
.next
```

**Environment Variables:**
```
NEXT_PUBLIC_HASURA_GRAPHQL_URL=https://your-hasura.render.app/v1/graphql
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

#### 4.3 Deploy

1. Click **Deploy site**
2. Your app will be live at `https://your-project.netlify.app`

---

## 5. Environment Variables

### 5.1 Frontend (Vercel/Netlify)

```env
# Public variables (exposed to browser)
NEXT_PUBLIC_HASURA_GRAPHQL_URL=https://your-hasura.render.app/v1/graphql
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 5.2 Hasura (Render/Railway)

```env
# Database
HASURA_GRAPHQL_DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Security
HASURA_GRAPHQL_ADMIN_SECRET=generate-strong-secret-here
HASURA_GRAPHQL_JWT_SECRET={"type":"HS256","key":"your-supabase-jwt-secret"}

# Features
HASURA_GRAPHQL_ENABLE_CONSOLE=false
HASURA_GRAPHQL_ENABLE_CORS=true
HASURA_GRAPHQL_CORS_DOMAIN=https://your-frontend.vercel.app

# Metadata
HASURA_GRAPHQL_METADATA_DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### 5.3 PDF Server (Render/Railway)

```env
NODE_ENV=production
PORT=3001
SUPABASE_URL=https://[PROJECT-REF].supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 5.4 Environment Variables Checklist

- [ ] All URLs use HTTPS in production
- [ ] Admin secrets are strong and unique
- [ ] JWT secrets match Supabase configuration
- [ ] CORS domains include all frontend URLs
- [ ] Service role keys are never exposed to frontend
- [ ] Database passwords are secure

---

## 6. Production Checklist

### Pre-Deployment

- [ ] All migrations run successfully
- [ ] RLS policies configured
- [ ] Hasura permissions set up
- [ ] Storage bucket created
- [ ] Environment variables documented

### Deployment

- [ ] Supabase project active
- [ ] Hasura deployed and accessible
- [ ] PDF server deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] All services can communicate

### Post-Deployment

- [ ] Test authentication flow
- [ ] Test GraphQL queries
- [ ] Test PDF generation
- [ ] Verify CORS configuration
- [ ] Check error logs
- [ ] Monitor performance
- [ ] Set up backups
- [ ] Configure monitoring/alerts

### Security

- [ ] Admin secrets are strong
- [ ] JWT secrets match
- [ ] CORS properly configured
- [ ] RLS policies active
- [ ] Service role keys secured
- [ ] HTTPS enabled everywhere
- [ ] Rate limiting configured (optional)

### Monitoring

- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure uptime monitoring
- [ ] Set up log aggregation
- [ ] Monitor database performance
- [ ] Track API usage

---

## 7. Troubleshooting

### Hasura Not Connecting to Database

- Verify `HASURA_GRAPHQL_DATABASE_URL` is correct
- Check database password is URL-encoded
- Verify IP whitelist in Supabase (if enabled)
- Check network connectivity

### CORS Errors

- Verify `HASURA_GRAPHQL_CORS_DOMAIN` includes frontend URL
- Check frontend URL matches exactly (including https)
- Verify CORS is enabled in Hasura

### Authentication Failures

- Verify JWT secret matches Supabase
- Check token expiration
- Verify user roles in database
- Check Hasura permissions

### PDF Generation Fails

- Verify PDF server is accessible
- Check Supabase Storage bucket exists
- Verify service role key is correct
- Check server logs for errors

### Frontend Build Errors

- Verify all environment variables are set
- Check API URLs are correct
- Verify dependencies are installed
- Check build logs

---

## 8. Quick Reference

### URLs to Update After Deployment

1. **Hasura Console**: `https://your-hasura.render.app/console`
2. **GraphQL Endpoint**: `https://your-hasura.render.app/v1/graphql`
3. **Frontend**: `https://your-project.vercel.app`
4. **PDF Server**: `https://your-pdf-server.render.app`

### Update Hasura Action Handler

After deploying PDF server, update Hasura Action:
1. Go to Hasura Console → **Actions**
2. Edit `generatePdfReport`
3. Update handler URL to: `https://your-pdf-server.render.app/actions/generatePdfReport`

### Testing Production

1. Test login/signup
2. Test GraphQL queries
3. Test PDF generation
4. Verify file downloads
5. Check error handling

---

## 9. Cost Estimation

### Supabase
- Free tier: 500MB database, 1GB storage
- Pro: $25/month (8GB database, 100GB storage)

### Hasura (Render)
- Free tier: 750 hours/month
- Starter: $7/month (always on)

### PDF Server (Render)
- Free tier: 750 hours/month
- Starter: $7/month (always on)

### Frontend (Vercel)
- Free tier: Unlimited
- Pro: $20/month (team features)

**Total Estimated Cost:**
- Free tier: $0/month (with limitations)
- Production: ~$59/month

---

## 10. Support

For deployment issues:
1. Check service logs
2. Verify environment variables
3. Test endpoints individually
4. Review error messages
5. Check service status pages

For platform-specific help:
- [Render Docs](https://render.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [Netlify Docs](https://docs.netlify.com)
- [Supabase Docs](https://supabase.com/docs)

