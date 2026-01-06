# RecruitSmart Deployment Guide

## Prerequisites
- GitHub account
- Railway account (https://railway.app)
- Vercel account (https://vercel.com)

## Step 1: Push Code to GitHub

```bash
# Initialize git (if not already done)
cd c:\Projects\crmapplication
git init
git add .
git commit -m "Initial commit - RecruitSmart CRM"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/recruitsmart-crm.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy Backend to Railway

### 2.1 Create Railway Project
1. Go to https://railway.app
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `recruitsmart-crm` repository
5. Railway will auto-detect it's a Java/Maven project

### 2.2 Add MySQL Database
1. In your Railway project, click "New"
2. Select "Database" → "MySQL"
3. Railway will create a MySQL instance and provide connection details

### 2.3 Configure Environment Variables
In Railway project settings, add these variables:

```
SPRING_PROFILES_ACTIVE=prod
DATABASE_URL=jdbc:mysql://<provided-by-railway>
DATABASE_USERNAME=<provided-by-railway>
DATABASE_PASSWORD=<provided-by-railway>
JWT_SECRET=<generate-a-long-random-string>
FRONTEND_URL=https://your-app.vercel.app
```

### 2.4 Set Root Directory
- In Railway settings → "Service Settings"
- Set "Root Directory" to `backend`

### 2.5 Get Backend URL
- After deployment, Railway will provide a URL like:
- `https://recruitsmart-crm-production.up.railway.app`

## Step 3: Deploy Frontend to Vercel

### 3.1 Import Project
1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Vercel will auto-detect Vite

### 3.2 Configure Build Settings
- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 3.3 Add Environment Variable
In Vercel project settings → "Environment Variables":

```
VITE_API_URL=https://your-backend.railway.app
```

### 3.4 Update Frontend API Calls
Before deploying, update all API calls in frontend to use:
```javascript
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';
```

### 3.5 Get Frontend URL
- Vercel will provide a URL like:
- `https://recruitsmart-crm.vercel.app`

## Step 4: Update CORS in Backend

Update Railway environment variable:
```
FRONTEND_URL=https://recruitsmart-crm.vercel.app
```

## Step 5: Test Deployment

1. Visit your Vercel URL
2. Register a new user
3. Test login
4. Verify all features work

## Automatic Deployments

✅ **Push to GitHub** → Automatic deployment to both Railway and Vercel  
✅ **Changes go live** in 1-3 minutes  
✅ **Rollback available** if something breaks  

## Monitoring

- **Railway**: Check logs in Railway dashboard
- **Vercel**: Check deployment logs in Vercel dashboard

## Cost

- **Railway**: $5 free credit/month (enough for small apps)
- **Vercel**: Unlimited free deployments for personal projects

## Your Live URLs (After Deployment)

- **Frontend**: `https://recruitsmart-crm.vercel.app`
- **Backend**: `https://recruitsmart-crm-production.up.railway.app`

---

## Quick Commands

### Deploy Updates
```bash
git add .
git commit -m "Your update message"
git push
# Both Railway and Vercel will auto-deploy!
```

### View Logs
- Railway: `railway logs`
- Vercel: Check dashboard or use Vercel CLI
