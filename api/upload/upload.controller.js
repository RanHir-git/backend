import { cloudinaryService } from '../../services/cloudinary.service.js'
import { logger } from '../../services/logger.service.js'

export const uploadController = {
    /**
     * Upload a single file
     * POST /api/upload
     */
    async uploadFile(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file provided' })
            }

            const { folder, resource_type, public_id } = req.body

            const uploadOptions = {
                folder: folder || 'uploads',
                resource_type: resource_type || 'auto',
                ...(public_id && { public_id })
            }

            const result = await cloudinaryService.uploadFile(req.file.buffer, {
                ...uploadOptions,
                transformation: {} // Can be customized based on needs
            })

            logger.info('File uploaded successfully:', result.public_id)

            res.json({
                success: true,
                data: result
            })
        } catch (error) {
            logger.error('Upload controller error:', error)
            res.status(500).json({
                error: 'Failed to upload file',
                message: error.message
            })
        }
    },

    /**
     * Upload multiple files
     * POST /api/upload/multiple
     */
    async uploadMultipleFiles(req, res) {
        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ error: 'No files provided' })
            }

            const { folder, resource_type } = req.body

            const uploadOptions = {
                folder: folder || 'uploads',
                resource_type: resource_type || 'auto'
            }

            // Upload all files in parallel
            const uploadPromises = req.files.map(file =>
                cloudinaryService.uploadFile(file.buffer, uploadOptions)
            )

            const results = await Promise.all(uploadPromises)

            logger.info(`Successfully uploaded ${results.length} files`)

            res.json({
                success: true,
                data: results,
                count: results.length
            })
        } catch (error) {
            logger.error('Multiple upload controller error:', error)
            res.status(500).json({
                error: 'Failed to upload files',
                message: error.message
            })
        }
    },

    /**
     * Delete a file from Cloudinary
     * DELETE /api/upload/:publicId
     */
    async deleteFile(req, res) {
        try {
            const { publicId } = req.params
            const { resource_type = 'image' } = req.query

            if (!publicId) {
                return res.status(400).json({ error: 'Public ID is required' })
            }

            const result = await cloudinaryService.deleteFile(publicId, resource_type)

            res.json({
                success: true,
                data: result
            })
        } catch (error) {
            logger.error('Delete file controller error:', error)
            res.status(500).json({
                error: 'Failed to delete file',
                message: error.message
            })
        }
    },

    /**
     * Delete multiple files from Cloudinary
     * DELETE /api/upload
     * Body: { publicIds: string[], resource_type?: string }
     */
    async deleteMultipleFiles(req, res) {
        try {
            const { publicIds, resource_type = 'image' } = req.body

            if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
                return res.status(400).json({ error: 'Public IDs array is required' })
            }

            const result = await cloudinaryService.deleteFiles(publicIds, resource_type)

            res.json({
                success: true,
                data: result
            })
        } catch (error) {
            logger.error('Delete multiple files controller error:', error)
            res.status(500).json({
                error: 'Failed to delete files',
                message: error.message
            })
        }
    },

    /**
     * Get upload signature for client-side uploads
     * GET /api/upload/signature
     */
    async getUploadSignature(req, res) {
        try {
            const { folder, resource_type } = req.query

            const signature = cloudinaryService.generateUploadSignature({
                folder: folder || 'uploads',
                resource_type: resource_type || 'auto'
            })

            res.json({
                success: true,
                data: signature
            })
        } catch (error) {
            logger.error('Get signature controller error:', error)
            res.status(500).json({
                error: 'Failed to generate signature',
                message: error.message
            })
        }
    }
}

