# CollabSpace Setup Guide

## Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (or local MongoDB)

## 1. Clone & Install

```bash
git clone <repository-url>
cd CollabSpace

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## 2. Environment Variables

### Backend Setup
Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/collabspace
JWT_SECRET=your_super_secret_access_token_key
JWT_REFRESH_SECRET=your_super_secret_refresh_token_key
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend Setup
Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## 3. Running the Application

Open two terminal windows.

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`.
