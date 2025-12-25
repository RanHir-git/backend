import configProd from './prod.js'
import configDev from './dev.js'
import { logger } from '../services/logger.service.js'

export var config

if (process.env.NODE_ENV === 'production') {
    config = configProd
    logger.info('Production config loaded')
    // Validate critical production environment variables
    if (!config.dbURL || config.dbURL.trim() === '') {
        logger.error('WARNING: MONGODB_URI environment variable is not set! Database connection will fail.')
    } else {
        logger.info('Database URL is configured')
    }
} else {
    config = configDev
    logger.info('Development config loaded')
}
console.log('Config loaded:', process.env.NODE_ENV)
// config=configProd
config.isGuestMode = true
