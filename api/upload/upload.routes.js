import express from 'express'
import { uploadController } from './upload.controller.js'
import { uploadSingle, uploadMultiple } from '../../middlewares/upload.middleware.js'
import { requireAuth } from '../../middlewares/requireAuth.middleware.js'

const router = express.Router()

// All upload routes require authentication
router.use(requireAuth)

// Upload single file
router.post('/', uploadSingle('file'), uploadController.uploadFile)

// Upload multiple files
router.post('/multiple', uploadMultiple('files', 10), uploadController.uploadMultipleFiles)

// Get upload signature for client-side uploads
router.get('/signature', uploadController.getUploadSignature)

// Delete single file
router.delete('/:publicId', uploadController.deleteFile)

// Delete multiple files
router.delete('/', uploadController.deleteMultipleFiles)

export const uploadRoutes = router

