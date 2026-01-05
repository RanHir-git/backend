# Backend API

A Node.js/Express backend API with MongoDB, Socket.io, and authentication.

## Features

- User authentication and authorization
- Board management (CRUD operations)
- Real-time updates with Socket.io
- File uploads with Cloudinary
- AI integration

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your configuration:
```
PORT=3030
MONGODB_URI=your_mongodb_connection_string
CLOUDINARY_URL=your_cloudinary_url
GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

3. Seed the database (optional):
```bash
npm run seed
```

4. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

- `/api/auth` - Authentication routes (including Google OAuth login)
- `/api/user` - User management
- `/api/board` - Board operations
- `/api/upload` - File uploads

## Google OAuth Authentication

**Important:** The backend verifies Google ID tokens server-side to keep authentication secure.

### How It Works:

1. **Frontend:** User signs in with Google using Google's OAuth library (Client ID can be public)
2. **Frontend:** Sends the Google ID token to your backend: `POST /api/auth/google`
3. **Backend:** Verifies the ID token is valid and extracts user information
4. **Backend:** Creates/updates user account and returns authentication cookie

### Setting up Google OAuth:

1. **Create OAuth Credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to **APIs & Services → Credentials**
   - Click **Create Credentials → OAuth client ID**
   - Choose **Web application**
   - Add authorized JavaScript origins:
     - `http://localhost:5173` (for development)
     - `https://your-frontend-domain.com` (for production)
   - Add authorized redirect URIs (if needed)
   - Copy the **Client ID** (not the Client Secret!)

2. **Backend Setup:**
   - Add `GOOGLE_CLIENT_ID=your_client_id_here` to your `.env` file
   - **In Render:** Add `GOOGLE_CLIENT_ID` to your environment variables (Settings → Environment Variables)

3. **Frontend Setup:**
   - Use Google's OAuth library (e.g., `@react-oauth/google` or Google Identity Services)
   - Use the **Client ID** in your frontend (it's safe to be public)
   - After user signs in, send the ID token to your backend:
   ```javascript
   // Frontend example
   const response = await fetch('/api/auth/google', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ idToken: googleIdToken })
   })
   ```

### Security Notes:

- ✅ **Client ID** can be public (used in frontend) - this is safe
- ✅ **ID Token** is verified server-side - prevents tampering
- ❌ **Never expose Client Secret** - keep it in Google Cloud Console only
- ❌ **Don't trust user data** - always verify the ID token on backend

This approach keeps your authentication secure and prevents credential cancellation.

## Tech Stack

- Express.js
- MongoDB
- Socket.io
- Cloudinary
- bcrypt

