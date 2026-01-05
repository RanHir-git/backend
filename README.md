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

- `/api/auth` - Authentication routes
- `/api/user` - User management
- `/api/board` - Board operations
- `/api/upload` - File uploads

## Tech Stack

- Express.js
- MongoDB
- Socket.io
- Cloudinary
- bcrypt

