import multer from 'multer'
import { logger } from '../services/logger.service.js'

// Configure multer to use memory storage (files will be in memory as buffers)
const storage = multer.memoryStorage()

// File filter function
const fileFilter = (req, file, cb) => {
    // Accept images, videos, and documents
    const allowedMimes = [
        // Images
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/bmp',
        'image/svg+xml',
        // Videos
        'video/mp4',
        'video/mpeg',
        'video/quicktime',
        'video/x-msvideo',
        'video/webm',
        // Documents
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        // Archives
        'application/zip',
        'application/x-zip-compressed',
        'application/x-rar-compressed',
        'application/x-7z-compressed',
        // Other
        'application/json',
        'text/csv'
    ]

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(new Error(`Invalid file type. Allowed types: images, videos, documents, and archives. Received: ${file.mimetype}`), false)
    }
}

// Configure multer
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
})

/**
 * Middleware for single file upload
 * Usage: uploadSingle('fieldName')
 */
export const uploadSingle = (fieldName = 'file') => {
    return (req, res, next) => {
        upload.single(fieldName)(req, res, (err) => {
            if (err) {
                logger.error('Upload error:', err)
                if (err instanceof multer.MulterError) {
                    if (err.code === 'LIMIT_FILE_SIZE') {
                        return res.status(400).json({ error: 'File too large. Maximum size is 50MB.' })
                    }
                    return res.status(400).json({ error: err.message })
                }
                return res.status(400).json({ error: err.message })
            }
            next()
        })
    }
}

/**
 * Middleware for multiple file uploads
 * Usage: uploadMultiple('fieldName', maxCount)
 */
export const uploadMultiple = (fieldName = 'files', maxCount = 10) => {
    return (req, res, next) => {
        upload.array(fieldName, maxCount)(req, res, (err) => {
            if (err) {
                logger.error('Upload error:', err)
                if (err instanceof multer.MulterError) {
                    if (err.code === 'LIMIT_FILE_SIZE') {
                        return res.status(400).json({ error: 'File too large. Maximum size is 50MB.' })
                    }
                    if (err.code === 'LIMIT_FILE_COUNT') {
                        return res.status(400).json({ error: `Too many files. Maximum is ${maxCount}.` })
                    }
                    return res.status(400).json({ error: err.message })
                }
                return res.status(400).json({ error: err.message })
            }
            next()
        })
    }
}

/**
 * Middleware for multiple fields with different file limits
 * Usage: uploadFields([{ name: 'images', maxCount: 5 }, { name: 'videos', maxCount: 3 }])
 */
export const uploadFields = (fields) => {
    return (req, res, next) => {
        upload.fields(fields)(req, res, (err) => {
            if (err) {
                logger.error('Upload error:', err)
                if (err instanceof multer.MulterError) {
                    if (err.code === 'LIMIT_FILE_SIZE') {
                        return res.status(400).json({ error: 'File too large. Maximum size is 50MB.' })
                    }
                    return res.status(400).json({ error: err.message })
                }
                return res.status(400).json({ error: err.message })
            }
            next()
        })
    }
}

