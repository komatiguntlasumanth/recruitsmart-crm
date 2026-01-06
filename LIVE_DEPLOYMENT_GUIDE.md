# 🚀 RecruitSmart CRM - Live Deployment Guide

This guide will help you deploy your RecruitSmart CRM application to production with automatic CI/CD from GitHub.

## 📋 Prerequisites

Before you begin, make sure you have:
- ✅ GitHub account with the code pushed to your repository
- ✅ Railway account (sign up at https://railway.app)
- ✅ Vercel account (sign up at https://vercel.com)

Both platforms offer generous free tiers perfect for this application!

---

## 🎯 Deployment Overview

- **Backend**: Railway.app (Spring Boot + MySQL)
- **Frontend**: Vercel (React + Vite)
- **CI/CD**: Automatic deployments on every `git push`

---

## 📦 Part 1: Deploy Backend to Railway

### Step 1: Create Railway Project

1. Go to https://railway.app and sign in
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `recruitsmart-crm` repository
5. Railway will auto-detect it's a Java/Maven project

### Step 2: Add MySQL Database

1. In your Railway project dashboard, click **"New"** → **"Database"** → **"Add MySQL"**
2. Railway will automatically create a MySQL instance
3. Click on the MySQL service to view connection details

### Step 3: Configure Environment Variables

1. Click on your backend service (not the database)
2. Go to the **"Variables"** tab
3. Add the following environment variables:

```bash
SPRING_PROFILES_ACTIVE=prod
DATABASE_URL=<copy from MySQL service>
DATABASE_USERNAME=<copy from MySQL service>
DATABASE_PASSWORD=<copy from MySQL service>
JWT_SECRET=<generate a long random string - at least 64 characters>
FRONTEND_URL=http://localhost:5173
```

> **Note**: We'll update `FRONTEND_URL` after deploying the frontend

**To generate a secure JWT_SECRET**, use this command in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 4: Configure Build Settings

1. In your backend service, go to **"Settings"**
2. Under **"Build"**, set:
   - **Root Directory**: `backend`
   - **Build Command**: `./mvnw clean package -DskipTests`
   - **Start Command**: `java -jar target/recruitsmart-crm-0.0.1-SNAPSHOT.jar`

### Step 5: Deploy!

1. Click **"Deploy"** or trigger a deployment
2. Wait for the build to complete (2-5 minutes)
3. Once deployed, Railway will provide a public URL like:
   ```
   https://recruitsmart-crm-production.up.railway.app
   ```
4. **Save this URL** - you'll need it for the frontend!

### Step 6: Verify Backend

Visit your backend URL + `/actuator/health`:
```
https://your-backend-url.railway.app/actuator/health
```

You should see: `{"status":"UP"}`

---

## 🎨 Part 2: Deploy Frontend to Vercel

### Step 1: Import Project

1. Go to https://vercel.com and sign in
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository `recruitsmart-crm`
4. Vercel will auto-detect Vite

### Step 2: Configure Build Settings

1. **Framework Preset**: Vite
2. **Root Directory**: `frontend`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Install Command**: `npm install`

### Step 3: Add Environment Variable

1. Go to **"Environment Variables"** section
2. Add the following variable:

```bash
VITE_API_URL=https://your-backend-url.railway.app
```

Replace `your-backend-url.railway.app` with your actual Railway backend URL from Part 1, Step 5.

### Step 4: Deploy!

1. Click **"Deploy"**
2. Wait for the build to complete (1-3 minutes)
3. Vercel will provide a URL like:
   ```
   https://recruitsmart-crm.vercel.app
   ```
4. **Save this URL** - this is your live website!

---

## 🔗 Part 3: Connect Frontend & Backend

### Update CORS in Backend

1. Go back to Railway
2. Click on your backend service
3. Go to **"Variables"** tab
4. Update the `FRONTEND_URL` variable with your Vercel URL:
   ```bash
   FRONTEND_URL=https://recruitsmart-crm.vercel.app
   ```
5. Railway will automatically redeploy with the new settings

---

## ✅ Part 4: Test Your Deployment

### 1. Visit Your Live Website

Open your Vercel URL in a browser:
```
https://recruitsmart-crm.vercel.app
```

### 2. Test Registration

1. Click **"Register"**
2. Create a new account:
   - Student: use any email
   - Manager: use email ending with `@manager.com`
   - Admin: use `komatiguntlasumanths@admin.com`

### 3. Test Login

1. Login with your newly created account
2. Verify you can access the dashboard

### 4. Test Features

- **Students**: View jobs, apply for jobs, update profile
- **Managers**: Post jobs, view applicants
- **Admin**: View user statistics

---

## 🔄 Part 5: Automatic Deployments (CI/CD)

Now that everything is set up, any code changes you push to GitHub will automatically deploy!

### How It Works

1. **Make changes** to your code locally
2. **Commit and push** to GitHub:
   ```bash
   git add .
   git commit -m "Your update message"
   git push
   ```
3. **Automatic deployment**:
   - Railway automatically deploys backend changes (2-5 min)
   - Vercel automatically deploys frontend changes (1-3 min)
4. **Changes go live** automatically!

### Monitor Deployments

- **Railway**: Check deployment logs in Railway dashboard
- **Vercel**: Check deployment status in Vercel dashboard

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: Backend won't start
- Check Railway logs for errors
- Verify all environment variables are set correctly
- Ensure MySQL database is running

**Problem**: Database connection errors
- Verify `DATABASE_URL`, `DATABASE_USERNAME`, and `DATABASE_PASSWORD` are correct
- Check if MySQL service is healthy in Railway

### Frontend Issues

**Problem**: Can't connect to backend
- Verify `VITE_API_URL` is set correctly in Vercel
- Check if backend is running (visit `/actuator/health`)
- Check browser console for CORS errors

**Problem**: CORS errors
- Verify `FRONTEND_URL` in Railway matches your Vercel URL exactly
- Ensure there are no trailing slashes

### General Issues

**Problem**: Changes not deploying
- Check GitHub to ensure code was pushed
- Check deployment logs in Railway/Vercel
- Try triggering a manual redeploy

---

## 📊 Environment Variables Reference

### Railway (Backend)
| Variable | Example | Description |
|----------|---------|-------------|
| `SPRING_PROFILES_ACTIVE` | `prod` | Activates production profile |
| `DATABASE_URL` | `jdbc:mysql://...` | Provided by Railway MySQL |
| `DATABASE_USERNAME` | `root` | Provided by Railway MySQL |
| `DATABASE_PASSWORD` | `password123` | Provided by Railway MySQL |
| `JWT_SECRET` | `your-secret-key...` | Generate 64+ char random string |
| `FRONTEND_URL` | `https://your-app.vercel.app` | Your Vercel frontend URL |

### Vercel (Frontend)
| Variable | Example | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `https://your-app.railway.app` | Your Railway backend URL |

---

## 💰 Cost Information

- **Railway**: $5 free credit/month (sufficient for small apps)
- **Vercel**: Unlimited free deployments for personal projects
- **Total**: FREE for personal/learning projects! 🎉

---

## 🎉 Congratulations!

Your RecruitSmart CRM is now live! Share your URLs:

- **Frontend**: `https://recruitsmart-crm.vercel.app`
- **Backend**: `https://recruitsmart-crm-production.up.railway.app`

Every time you push code to GitHub, your changes will automatically go live within minutes!

---

## 📞 Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Review Railway and Vercel deployment logs
3. Verify all environment variables are set correctly
4. Ensure your local code works before deploying

Happy deploying! 🚀
