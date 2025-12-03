# Backend Connection Diagnostic Tool

## How to Use

1. **Start both servers:**
   - Backend: `cd backend && npm run dev`
   - Frontend: `npm run dev`

2. **Open the test page:**
   - Navigate to: `http://localhost:8080/backend-test`
   - Or click the "Run Connection Tests" button

3. **Review the results:**
   - Green = Success ✅
   - Red = Error ❌
   - Blue = Pending/Testing 🔄

4. **Check backend terminal:**
   - You'll see detailed logs for every request
   - Each step of the process is logged
   - Errors are clearly marked

## What the Tests Check

1. **Backend Health Check (Direct)** - Tests if backend is running on port 5000
2. **Backend API Endpoint (Direct)** - Tests if `/api` endpoint works
3. **Backend via Proxy (Frontend)** - Tests if Vite proxy is working
4. **Registration Endpoint (Direct)** - Tests registration directly to backend
5. **Registration Endpoint (via Proxy)** - Tests registration through proxy
6. **Login Endpoint (Direct)** - Tests login directly to backend
7. **Login Endpoint (via Proxy)** - Tests login through proxy

## Backend Logging

The backend now logs:
- ✅ Every incoming request with full details
- ✅ Request headers (Origin, Host, User-Agent, Content-Type)
- ✅ Request body for POST/PUT requests
- ✅ Response status and data
- ✅ Step-by-step process in controllers
- ✅ All errors with full stack traces

## Understanding the Logs

### Request Log Format:
```
============================================================
📥 [2024-01-01T12:00:00.000Z] POST /api/users/register
   Origin: http://localhost:8080
   Host: localhost:5000
   User-Agent: Mozilla/5.0...
   Content-Type: application/json
   Accept: application/json
   Body: { name: 'Test', email: 'test@test.com', ... }
```

### Controller Log Format:
```
🔵 [createUser] Called
   Request body: { name: 'Test', email: 'test@test.com', ... }
   🔍 Checking if email exists...
   ✅ Email is available
   🔐 Hashing password...
   💾 Creating user in database...
   ✅ User created: { id: '...', email: '...', role: 'USER' }
   🎫 Generating JWT token...
   ✅ Token generated
   📤 Sending success response
```

### Error Log Format:
```
❌ [createUser] ERROR:
   Error code: P1001
   Error message: Can't reach database server
   Error stack: ...
   Full error: { ... }
   🔴 Database connection error detected
   📤 Sending error response
```

## Troubleshooting

### If Direct Tests Fail:
- Backend server is not running
- Backend is on a different port
- Firewall blocking port 5000

### If Proxy Tests Fail:
- Frontend server needs to be restarted
- Vite proxy configuration issue
- CORS issue (check backend logs)

### If Registration/Login Tests Fail:
- Check backend logs for detailed error
- Database connection issue (P1001 error)
- Missing fields in request
- Email already exists (409 error)

## Next Steps

After running the tests:
1. Share the test results
2. Share the backend terminal output
3. We'll identify the exact issue and fix it


