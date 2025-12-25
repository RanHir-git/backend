import { MongoClient } from 'mongodb'

import { config } from '../config/index.js'
import { logger } from './logger.service.js'

export const dbService = {
    getCollection
}

var dbConn = null

async function getCollection(collectionName) {

    console.log("user service:"+config.dbName)
    try {
        const db = await _connect()
        const collection = await db.collection(collectionName)
        return collection
    } catch (err) {
        logger.error('Failed to get Mongo collection', err)
        throw err
    }
}


async function _connect() {
    if (dbConn) return dbConn
    
    // Validate database URL before attempting connection
    if (!config.dbURL || config.dbURL.trim() === '') {
        const error = new Error('Database URL is not configured. Please set MONGODB_URI environment variable.')
        logger.error('Cannot Connect to DB - Missing database URL', error)
        throw error
    }
    
    try {
        logger.info(`Attempting to connect to database: ${config.dbName}`)
        const client = await MongoClient.connect(config.dbURL)
        const db = client.db(config.dbName)
        dbConn = db
        logger.info(`Successfully connected to database: ${config.dbName}`)
        return db
    } catch (err) {
        logger.error('Cannot Connect to DB', err)
        logger.error(`Database URL: ${config.dbURL ? 'Set (hidden)' : 'NOT SET'}`)
        logger.error(`Database Name: ${config.dbName}`)
        throw err
    }
}