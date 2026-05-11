# Deployment Guide

This guide will help you deploy CollabeSpace to production. Because this project uses **Socket.io** for real-time features, the backend requires a host that supports persistent WebSockets.

## Recommended Strategy

- **Frontend**: [Vercel](https://vercel.com) (Best for React/Vite apps)
- **Backend**: [Render](https://render.com) or [Railway](https://railway.app) (Best for Node.js apps with WebSockets)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Free tier available)

---

## 1. Backend Deployment (Render/Railway)

### Steps for Render:
1. Create a new **Web Service** on Render.
2. Connect your GitHub repository.
3. Set the following configurations:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Add **Environment Variables**:
   - `PORT`: `10000` (Render's default)
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A long random string
   - `JWT_REFRESH_SECRET`: Another long random string
   - `FRONTEND_URL`: Your Vercel deployment URL (e.g., `https://collabe-space.vercel.app`)
   - `NODE_ENV`: `production`
   - `GROQ_API_KEY`: Your Groq API key

---

## 2. Frontend Deployment (Vercel)

### Steps for Vercel:
1. Go to the [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New > Project**.
2. Connect your GitHub repository.
3. In the project settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add **Environment Variables**:
   - `VITE_API_URL`: Your backend URL + `/api` (e.g., `https://collabe-space-backend.onrender.com/api`)
   - `VITE_SOCKET_URL`: Your backend URL (e.g., `https://collabe-space-backend.onrender.com`)
5. Click **Deploy**.

---

## Important Notes on WebSockets

> [!WARNING]
> **Vercel Serverless Functions do not support WebSockets.**
> If you try to host the backend on Vercel, the real-time features (typing indicators, instant task updates) will not work. This is why we recommend Render or Railway for the backend.

## Post-Deployment Checklist

1. **CORS Configuration**: Ensure `FRONTEND_URL` in your backend environment variables exactly matches your Vercel URL.
2. **MongoDB Access**: Add your backend server's IP address (or `0.0.0.0/0` for Render) to the MongoDB Atlas Network Access whitelist.
3. **API Endpoints**: Double-check that `VITE_API_URL` and `VITE_SOCKET_URL` in Vercel do not have trailing slashes if your code doesn't expect them.
