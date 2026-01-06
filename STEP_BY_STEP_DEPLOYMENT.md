# Step-by-Step Deployment Guide

## Part 1: Deploy Backend to Railway (5-10 minutes)

### Step 1: Sign Up for Railway

1. Open your browser and go to: **https://railway.app**
2. Click the **"Login"** button in the top right
3. Click **"Login with GitHub"**
4. Authorize Railway to access your GitHub account
5. You'll be redirected to the Railway dashboard

### Step 2: Create New Project

1. On the Railway dashboard, click **"+ New Project"**
2. Select **"Deploy from GitHub repo"**
3. You'll see a list of your repositories
4. Find and click **"recruitsmart-crm"**
5. Railway will start analyzing your repository

### Step 3: Configure Backend Service

1. Railway will detect multiple directories (frontend/backend)
2. Click on the service that was created
3. Go to **"Settings"** tab
4. Scroll to **"Root Directory"**
5. Enter: `backend`
6. Click **"Save"**

### Step 4: Add MySQL Database

1. In your Railway project dashboard, click **"+ New"**
2. Select **"Database"**
3. Click **"Add MySQL"**
4. Railway will provision a MySQL database (takes 30 seconds)
5. The database will appear as a new service in your project

### Step 5: Set Environment Variables

1. Click on your **backend service** (not the database)
2. Go to the **"Variables"** tab
3. Click **"+ New Variable"** and add these one by one:

   ```
   Variable Name: SPRING_PROFILES_ACTIVE
   Value: prod
   ```

   ```
   Variable Name: JWT_SECRET
   Value: your-super-secret-jwt-key-make-it-long-and-random-123456789
   ```

   ```
   Variable Name: FRONTEND_URL
   Value: http://localhost:5173
   ```
   (We'll update this after deploying frontend)

4. Click **"Add"** for each variable

### Step 6: Connect Database to Backend

1. Click on your **MySQL database service**
2. Go to **"Variables"** tab
3. Copy the following values (click the copy icon):
   - `MYSQLHOST`
   - `MYSQLPORT`
   - `MYSQLDATABASE`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`

4. Go back to your **backend service**
5. Go to **"Variables"** tab
6. Add these variables:

   ```
   Variable Name: DATABASE_URL
   Value: jdbc:mysql://MYSQLHOST:MYSQLPORT/MYSQLDATABASE
   ```
   (Replace MYSQLHOST, MYSQLPORT, MYSQLDATABASE with actual values)

   ```
   Variable Name: DATABASE_USERNAME
   Value: (paste MYSQLUSER value)
   ```

   ```
   Variable Name: DATABASE_PASSWORD
   Value: (paste MYSQLPASSWORD value)
   ```

### Step 7: Deploy Backend

1. Railway will automatically start deploying
2. Go to **"Deployments"** tab to watch progress
3. Wait 3-5 minutes for the build to complete
4. Once successful, go to **"Settings"** tab
5. Scroll to **"Networking"**
6. Click **"Generate Domain"**
7. Copy your backend URL (e.g., `https://recruitsmart-crm-production.up.railway.app`)

**✅ Backend Deployed!**

---

## Part 2: Deploy Frontend to Vercel (3-5 minutes)

### Step 1: Sign Up for Vercel

1. Open your browser and go to: **https://vercel.com**
2. Click **"Sign Up"** in the top right
3. Click **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub account
5. You'll be redirected to the Vercel dashboard

### Step 2: Import Project

1. On the Vercel dashboard, click **"Add New..."**
2. Select **"Project"**
3. You'll see a list of your GitHub repositories
4. Find **"recruitsmart-crm"** and click **"Import"**

### Step 3: Configure Build Settings

1. Vercel will show the "Configure Project" screen
2. Set these values:

   **Framework Preset**: Select **"Vite"** from dropdown
   
   **Root Directory**: Click **"Edit"** → Select **"frontend"** → Click **"Continue"**
   
   **Build Command**: `npm run build` (should be auto-filled)
   
   **Output Directory**: `dist` (should be auto-filled)
   
   **Install Command**: `npm install` (should be auto-filled)

### Step 4: Add Environment Variable

1. Scroll down to **"Environment Variables"** section
2. Click to expand it
3. Add this variable:

   ```
   Name: VITE_API_URL
   Value: https://your-backend-railway-url.railway.app
   ```
   (Paste your actual Railway backend URL from Part 1, Step 7)

4. Make sure **"Production"** is checked

### Step 5: Deploy Frontend

1. Click the **"Deploy"** button
2. Vercel will start building your frontend
3. Wait 2-3 minutes for deployment to complete
4. Once successful, you'll see a **"Congratulations"** screen
5. Click **"Continue to Dashboard"**
6. Copy your frontend URL (e.g., `https://recruitsmart-crm.vercel.app`)

**✅ Frontend Deployed!**

---

## Part 3: Final Configuration (2 minutes)

### Update CORS in Railway

1. Go back to **Railway dashboard**
2. Click on your **backend service**
3. Go to **"Variables"** tab
4. Find the **"FRONTEND_URL"** variable
5. Click **"Edit"** (pencil icon)
6. Update the value to your Vercel URL:
   ```
   https://recruitsmart-crm.vercel.app
   ```
7. Click **"Save"**
8. Railway will automatically redeploy (wait 2-3 minutes)

---

## 🎉 Deployment Complete!

### Your Live Application URLs:

- **Frontend (User Access)**: `https://recruitsmart-crm.vercel.app`
- **Backend (API)**: `https://recruitsmart-crm-production.up.railway.app`

### Test Your Application:

1. Visit your Vercel URL
2. Try registering with `test@hr.com`
3. Login as admin: `komatiguntlasumanths@admin.com`
4. Approve the HR user
5. Test all features!

---

## 🔄 Future Updates (Automatic Deployment)

Whenever you make code changes:

```bash
git add .
git commit -m "Your changes description"
git push
```

Both Railway and Vercel will automatically detect the changes and redeploy in 1-3 minutes!

---

## 📊 Monitoring & Logs

### Railway Logs:
1. Go to Railway dashboard
2. Click your backend service
3. Click **"Deployments"** tab
4. Click on the latest deployment
5. View real-time logs

### Vercel Logs:
1. Go to Vercel dashboard
2. Click your project
3. Click **"Deployments"** tab
4. Click on the latest deployment
5. Click **"View Function Logs"**

---

## ⚠️ Troubleshooting

### Backend won't start:
- Check Railway logs for errors
- Verify all environment variables are set correctly
- Ensure database connection variables are correct

### Frontend shows API errors:
- Verify `VITE_API_URL` is set correctly in Vercel
- Check that Railway backend is running
- Verify CORS is configured with correct Vercel URL

### Database connection failed:
- Verify DATABASE_URL format is correct
- Check MYSQLHOST, MYSQLPORT values
- Ensure MySQL service is running in Railway

---

## 💡 Pro Tips

1. **Custom Domain**: You can add your own domain in Vercel settings
2. **Environment Secrets**: Use Railway's secret variables for sensitive data
3. **Automatic Backups**: Railway provides automatic database backups
4. **Preview Deployments**: Vercel creates preview URLs for each Git branch
5. **Rollback**: Both platforms allow instant rollback to previous deployments

---

## 📞 Need Help?

- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **Your GitHub Repo**: https://github.com/komatiguntlasumanth/recruitsmart-crm
