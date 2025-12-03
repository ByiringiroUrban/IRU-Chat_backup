# Test Backend Connection

## Quick Test Commands

### Test 1: Check if backend is responding
Open in browser: `http://localhost:5000`
Should see: `{"message":"IRU Chat API is running"}`

### Test 2: Check if API endpoint works
Open in browser: `http://localhost:5000/api`
Should see: `{"message":"IRU Chat API","version":"1.0.0"}`

### Test 3: Test registration endpoint (PowerShell)
```powershell
$body = @{
    name = "Test User"
    email = "test@example.com"
    password = "test123"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:5000/api/users/register" -Method POST -Body $body -ContentType "application/json"
$response.Content
```

### Test 4: Test login endpoint (PowerShell)
```powershell
$body = @{
    email = "test@example.com"
    password = "test123"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:5000/api/users/login" -Method POST -Body $body -ContentType "application/json"
$response.Content
```

## If Backend is Not Responding

1. **Check if backend is running:**
   ```powershell
   netstat -ano | findstr :5000
   ```
   Should show port 5000 is LISTENING

2. **Check backend console for errors:**
   - Look for error messages
   - Check if routes are registered
   - Verify database connection

3. **Restart backend:**
   ```bash
   cd backend
   npm run dev
   ```

## If Proxy is Not Working

1. **Restart frontend server:**
   - Stop frontend (Ctrl+C)
   - Start again: `npm run dev`

2. **Check Vite proxy logs:**
   - Should see `🔄 Proxying:` messages in frontend console
   - Should see `✅ Proxy response:` messages

3. **Test proxy directly:**
   - Open `http://localhost:8080/api` in browser
   - Should see: `{"message":"IRU Chat API","version":"1.0.0"}`
   - If you see 404, proxy is not working


