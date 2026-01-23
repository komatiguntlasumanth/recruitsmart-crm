# Railway Deployment Guide for RecruitSmart CRM

## Overview
Deploying the RecruitSmart CRM (Spring Boot + React) to Railway with MySQL.

## Part 1: Backend & Database Setup

### 1. Create Project & Database
1.  Log in to [Railway](https://railway.app).
2.  Click **+ New Project** -> **Deploy from GitHub repo**.
3.  Select **recruitsmart-crm**.
4.  Once the project is created, click **+ New** -> **Database** -> **Add MySQL**.

### 2. Configure Backend Service
1.  Click on the **recruitsmart-crm** service card.
2.  **Settings** Tab:
    *   **Root Directory**: `backend`
    *   **Watch Paths**: `/backend/**`
3.  **Variables** Tab:
    *   Add `SPRING_PROFILES_ACTIVE` = `prod`
    *   Add `JWT_SECRET` = (Your secure secret key)
    *   Add `GEMINI_API_KEY` = (Your Google Gemini API Key)
    *   Add `FRONTEND_URL` = `https://<YOUR-FRONTEND-URL>.vercel.app` (You will update this later)

### 3. Connect Database
1.  Still in the **Variables** tab of the backend service.
2.  Click **Variable Reference**.
3.  Select `MYSQLHOST`, `MYSQLPORT`, `MYSQLDATABASE`, `MYSQLUSER`, `MYSQLPASSWORD` from the dropdown list to link them from your MySQL service.

### 4. Deploy Backend
1.  Railway will auto-deploy. Check **Deployments** tab for logs.
2.  Once successful, go to **Settings** -> **Networking** -> **Generate Domain**.
3.  **Copy this URL** (e.g., `https://backend-production.up.railway.app`).

---

## Part 2: Frontend Deployment (Vercel)

### 1. Import Project
1.  Log in to [Vercel](https://vercel.com).
2.  **Add New...** -> **Project** -> Import `recruitsmart-crm`.

### 2. Configure Build
*   **Framework Preset**: Vite
*   **Root Directory**: `frontend`

### 3. Environment Variables
Add the following variable in Vercel:
*   `VITE_API_URL` = (Paste your Railway Backend URL here)

### 4. Deploy
Click **Deploy**.

---

## Part 3: Final Connection

1.  Copy your new **Vercel Frontend URL**.
2.  Go back to **Railway** -> Backend Service -> **Variables**.
3.  Update `FRONTEND_URL` with the Vercel URL.
4.  Railway will redeploy automatically.

## Troubleshooting
*   **Database Connection Failed**: Ensure you used **Variable Reference** (the purple pill format) for all `MYSQL*` variables in the backend service so they stay in sync.
*   **CORS Errors**: Verify `FRONTEND_URL` in Railway perfectly matches your Vercel URL (no trailing slash).
