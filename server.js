import 'dotenv/config'
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)


import { logger } from './services/logger.service.js'
import { dbService } from './services/db.service.js'
logger.info('server.js loaded...')

const app = express()

// Express App Config
app.use(cookieParser())
app.use(express.json())
app.use(express.static('public'))
app.set('query parser', 'extended')


if (process.env.NODE_ENV === 'production') {
    // Express serve static files on production environment
    app.use(express.static(path.resolve(__dirname, 'public')))
    console.log('__dirname: ', __dirname)
    
    // CORS for production - allow requests from the same origin (since frontend and backend are served together)
    // But also allow credentials for cookies
    app.use(cors({
        origin: true, // Allow same-origin requests
        credentials: true
    }))
} else {
    // Configuring CORS for development
    const corsOptions = {
        // Make sure origin contains the url your frontend is running on
        origin: [
            'http://127.0.0.1:5173',
            'http://localhost:5173',
            'http://127.0.0.1:5174',
            'http://localhost:5174',
            'http://127.0.0.1:3000',
            'http://localhost:3000',
            'http://127.0.0.1:8080',
            'http://localhost:8080',
        ],
        credentials: true
    }
    app.use(cors(corsOptions))
}

import { authRoutes } from './api/auth/auth.routes.js'
import { userRoutes } from './api/user/user.routes.js'
import { boardRoutes } from './api/board/board.routes.js'
import { uploadRoutes } from './api/upload/upload.routes.js'


// routes
import { setupAsyncLocalStorage } from './middlewares/setupAls.middleware.js'
app.all('/*all', setupAsyncLocalStorage)

app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/board', boardRoutes)
app.use('/api/upload', uploadRoutes)

app.get('/*all', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

const port = process.env.PORT || 3030

// Test database connection on startup
async function testDatabaseConnection() {
    try {
        await dbService.getCollection('user')
        logger.info('Database connection test: SUCCESS')
    } catch (err) {
        logger.error('Database connection test: FAILED')
        logger.error('Server will start but database operations will fail until connection is established')
    }
}

app.listen(port, async () => {
    logger.info('Server is running on port: ' + port)
    logger.info('Environment: ' + (process.env.NODE_ENV || 'development'))
    await testDatabaseConnection()
})