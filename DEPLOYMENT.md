# 🚀 SmartFlow AI — Production Deployment Guide

This guide provides step-by-step instructions to deploy **SmartFlow AI** live to the cloud.

---

## ⚡ Option 1: Render (Recommended — Free Full-Stack Deployment)

Render allows you to deploy both the **Frontend** and **Backend API** together on a single web service.

### Step-by-Step:
1. Go to **[https://dashboard.render.com/](https://dashboard.render.com/)** and sign in.
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository: `https://github.com/RamyaSreeChowdam/Smart-Flow-ai`.
4. Configure the service settings:
   - **Name**: `smart-flow-ai`
   - **Environment**: `Node`
   - **Build Command**: `npm run install:all && npm run build`
   - **Start Command**: `npm start`
5. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: `mongodb://ramyasreechowdam_db_user:APuSLelZnP8VchEi@ac-zpsmyyn-shard-00-00.zzsl26p.mongodb.net:27017,ac-zpsmyyn-shard-00-01.zzsl26p.mongodb.net:27017,ac-zpsmyyn-shard-00-02.zzsl26p.mongodb.net:27017/smartflow?ssl=true&authSource=admin&retryWrites=true&w=majority`
   - `JWT_SECRET`: `smartflow_secret_key_2024_hackathon`
6. Click **Create Web Service**. Your live app URL will be ready in 2 minutes!

---

## ⚡ Option 2: Vercel (Frontend) + Render (Backend)

### A. Deploy Backend on Render / Railway
1. Deploy the `backend` directory to Render/Railway using `node server.js`.
2. Copy your live backend URL (e.g. `https://smartflow-api.onrender.com`).

### B. Deploy Frontend on Vercel
1. Go to **[https://vercel.com/new](https://vercel.com/new)**.
2. Import repository `RamyaSreeChowdam/Smart-Flow-ai`.
3. Set **Root Directory** to `frontend`.
4. Add Environment Variable:
   - `VITE_API_URL`: `https://smartflow-api.onrender.com/api`
5. Click **Deploy**.

---

## 🧪 Local Production Verification

To verify the production build locally on your machine:

```bash
# 1. Build frontend dist
npm run build

# 2. Start production server
npm start
```
Visit: **http://localhost:5000**
