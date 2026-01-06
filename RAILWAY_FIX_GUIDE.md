# Railway Deployment Fix Guide

## Common Issues and Solutions

### Issue 1: Root Directory Not Set

**Click on your service** → **Settings** → Scroll to **"Root Directory"**

Set it to: `backend`

Click **Save**

### Issue 2: Build Command Issues

Railway might not be detecting the Maven build correctly. Let's add explicit build configuration.

**In Settings tab:**
- **Build Command**: `./mvnw clean package -DskipTests`
- **Start Command**: `java -Dserver.port=$PORT -jar target/recruitsmart-crm-0.0.1-SNAPSHOT.jar`

### Issue 3: Missing Environment Variables

Go to **Variables** tab and ensure these are set:

```
SPRING_PROFILES_ACTIVE=prod
PORT=8080
```

### Issue 4: Java Version

Railway might be using wrong Java version. Add this file to force Java 24:

Create `nixpacks.toml` in backend folder (I'll do this for you)

## Step-by-Step Fix Process

### Step 1: Check Deployment Logs

1. Click on **"recruitsmart-crm"** service
2. Click **"Deployments"** tab
3. Click on the failed deployment
4. Read the error message
5. Share the error with me if you need help

### Step 2: Set Root Directory (MOST COMMON FIX)

1. Click **"Settings"** tab
2. Scroll to **"Root Directory"**
3. Enter: `backend`
4. Click **"Save"**
5. Railway will automatically redeploy

### Step 3: Configure Build Settings

1. In **Settings** tab, scroll to **"Build"** section
2. Set **Build Command**: 
   ```
   ./mvnw clean package -DskipTests
   ```
3. Set **Start Command**:
   ```
   java -Dserver.port=$PORT -jar target/recruitsmart-crm-0.0.1-SNAPSHOT.jar
   ```
4. Click **"Save"**

### Step 4: Verify Environment Variables

1. Click **"Variables"** tab
2. Make sure you have:
   - `SPRING_PROFILES_ACTIVE` = `prod`
   - `DATABASE_URL` = (from MySQL service)
   - `DATABASE_USERNAME` = (from MySQL service)
   - `DATABASE_PASSWORD` = (from MySQL service)
   - `JWT_SECRET` = (any long random string)
   - `FRONTEND_URL` = `http://localhost:5173` (temporary)

### Step 5: Manual Redeploy

1. Go to **"Deployments"** tab
2. Click **"Deploy"** button in top right
3. Wait 3-5 minutes
4. Check logs for success

## What to Look for in Logs

### Success Indicators:
- ✅ "BUILD SUCCESSFUL"
- ✅ "Started RecruitsmartCrmApplication"
- ✅ "Tomcat started on port"

### Error Indicators:
- ❌ "BUILD FAILED"
- ❌ "No such file or directory"
- ❌ "Could not find or load main class"
- ❌ "Connection refused" (database issue)

## Quick Checklist

- [ ] Root Directory set to `backend`
- [ ] Build command configured
- [ ] Start command configured
- [ ] All environment variables set
- [ ] MySQL database service running
- [ ] Java version configured (nixpacks.toml)

## Still Not Working?

If deployment still fails after these steps:

1. **Click on the deployment** in Deployments tab
2. **Copy the error message** from the logs
3. **Share it with me** and I'll provide specific fix

## Alternative: Use Dockerfile

If Railway still has issues, we can use Docker instead. Let me know if you want to try that approach.
