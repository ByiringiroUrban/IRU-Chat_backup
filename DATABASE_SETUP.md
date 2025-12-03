# Database Setup Instructions

## Fix Database Connection Error (500 Error)

The error "Database `railwayy` does not exist" means your database connection is not configured correctly.

### Steps to Fix:

1. **Check your `.env` file in the `backend` folder**
   - Make sure you have a `DATABASE_URL` set
   - Example for PostgreSQL:
     ```
     DATABASE_URL="postgresql://username:password@localhost:5432/iruchat"
     ```

2. **Create the Database**
   - If using PostgreSQL locally, connect to PostgreSQL and run:
     ```sql
     CREATE DATABASE iruchat;
     ```

3. **Run Prisma Migrations**
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma generate
   ```

4. **Restart your backend server**
   ```bash
   npm run dev
   ```

### For Railway/Cloud Databases:
- Use the connection string provided by your database provider
- Make sure the database exists in your provider's dashboard
- The connection string should look like:
  ```
  DATABASE_URL="postgresql://user:password@host:port/database"
  ```

## Fix Vite HMR Cache Issue (AccountSettings.tsx 404)

The `AccountSettings.tsx` error is a Vite cache issue. To fix:

1. **Stop your frontend dev server** (Ctrl+C)

2. **Clear Vite cache and restart:**
   ```bash
   # Delete node_modules/.vite folder (if exists)
   rm -rf node_modules/.vite
   # Or on Windows:
   rmdir /s /q node_modules\.vite
   
   # Restart dev server
   npm run dev
   ```

3. **If that doesn't work, do a full clean:**
   ```bash
   # Delete node_modules and reinstall
   rm -rf node_modules
   npm install
   npm run dev
   ```

The file is correctly named `Account.tsx` and should work after clearing the cache.

