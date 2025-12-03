# Fix for 404 Error on Registration/Login

## Problem
The frontend was getting 404 errors and HTML responses (DOCTYPE) instead of JSON, which means requests were hitting the Vite dev server instead of the backend.

## Solution Applied

### 1. Added Vite Proxy Configuration
- Updated `vite.config.ts` to proxy `/api/*` requests to `http://localhost:5000`
- This allows the frontend to use relative URLs (`/api/users/register`) instead of absolute URLs

### 2. Updated API Base URL
- Changed `API_BASE_URL` in `Auth.tsx` to use empty string (relative URLs)
- This makes requests go through the Vite proxy in development

### 3. Enhanced Error Handling
- Added detailed logging in both frontend and backend
- Added checks to detect when HTML is returned instead of JSON
- Better error messages to help diagnose issues

### 4. Enhanced Backend Logging
- Backend now logs all incoming requests with origin and content-type
- This helps verify requests are reaching the backend

## Steps to Fix

### Step 1: Restart Frontend Dev Server
**IMPORTANT:** You must restart the frontend dev server for the proxy to work!

1. Stop the frontend server (Ctrl+C)
2. Start it again:
   ```bash
   npm run dev
   ```

### Step 2: Verify Backend is Running
In the `backend` folder, make sure you see:
```
✅ Server running on http://localhost:5000
📡 API endpoints available at http://localhost:5000/api
📋 Registering user routes:
  GET    /api/users
  POST   /api/users/register
  POST   /api/users/login
```

### Step 3: Test Registration
1. Open the browser console (F12)
2. Try to register a new account
3. Check the console logs:
   - Frontend: Should show `🟢 Sign up request to: /api/users/register`
   - Backend: Should show `📥 POST /api/users/register`

### Step 4: Check for Errors
If you still see errors:
- **404 Error**: Backend server is not running or proxy not working (restart frontend)
- **HTML Response**: Request is still hitting wrong server (check proxy config)
- **CORS Error**: Backend CORS config needs updating

## How It Works Now

1. Frontend makes request to `/api/users/register` (relative URL)
2. Vite dev server intercepts `/api/*` requests
3. Vite proxy forwards to `http://localhost:5000/api/users/register`
4. Backend receives and processes the request
5. Backend returns JSON response
6. Vite proxy forwards response back to frontend

## Debugging

### Check Frontend Console
Look for:
- `🟢 Sign up request to: /api/users/register` (should be relative URL)
- `🟢 Response status: 200` or error code
- Any error messages

### Check Backend Console
Look for:
- `📥 POST /api/users/register` (means request reached backend)
- `Origin: http://localhost:8080` (should match your frontend URL)
- Any error messages

### If Still Not Working
1. Verify both servers are running:
   - Frontend: `http://localhost:8080`
   - Backend: `http://localhost:5000`
2. Test backend directly:
   - Open `http://localhost:5000` in browser
   - Should see: `{"message":"IRU Chat API is running"}`
3. Check Vite proxy:
   - Open `http://localhost:8080/api` in browser
   - Should see: `{"message":"IRU Chat API","version":"1.0.0"}`


