import { v2 as cloudinary } from 'cloudinary'
import { config } from '../config/index.js'
import { logger } from './logger.service.js'

// Configure Cloudinary
cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret
})

export const cloudinaryService = {
    /**
     * Upload a file to Cloudinary
     * @param {Buffer|string} file - File buffer or file path
     * @param {Object} options - Upload options
     * @param {string} options.folder - Folder path in Cloudinary
     * @param {string} options.resource_type - 'image', 'video', or 'raw'
     * @param {string} options.public_id - Custom public ID for the file
     * @param {Object} options.transformation - Image/video transformation options
     * @returns {Promise<Object>} Upload result with URL and public_id
     */
    async uploadFile(file, options = {}) {
        try {
            const {
                folder = 'uploads',
                resource_type = 'auto', // 'auto' detects image/video automatically
                public_id = null,
                transformation = {}
            } = options

            const uploadOptions = {
                folder,
                resource_type,
                ...(public_id && { public_id }),
                ...(Object.keys(transformation).length > 0 && { transformation })
            }

            // If file is a buffer (from multer), use upload_stream
            if (Buffer.isBuffer(file)) {
                // For buffers, we need to use upload_stream
                return new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        uploadOptions,
                        (error, result) => {
                            if (error) {
                                logger.error('Cloudinary upload error:', error)
                                reject(error)
                            } else {
                                logger.info('File uploaded successfully:', result.public_id)
                                resolve({
                                    url: result.secure_url,
                                    public_id: result.public_id,
                                    format: result.format,
                                    resource_type: result.resource_type,
                                    bytes: result.bytes,
                                    width: result.width,
                                    height: result.height,
                                    duration: result.duration // for videos
                                })
                            }
                        }
                    )
                    uploadStream.end(file)
                })
            } else {
                // For file paths or data URIs
                const result = await cloudinary.uploader.upload(file, uploadOptions)
                return {
                    url: result.secure_url,
                    public_id: result.public_id,
                    format: result.format,
                    resource_type: result.resource_type,
                    bytes: result.bytes,
                    width: result.width,
                    height: result.height,
                    duration: result.duration
                }
            }
        } catch (error) {
            logger.error('Cloudinary upload error:', error)
            throw error
        }
    },

    /**
     * Delete a file from Cloudinary
     * @param {string} publicId - Public ID of the file to delete
     * @param {string} resource_type - 'image', 'video', or 'raw'
     * @returns {Promise<Object>} Deletion result
     */
    async deleteFile(publicId, resource_type = 'image') {
        try {
            const result = await cloudinary.uploader.destroy(publicId, {
                resource_type
            })
            logger.info('File deleted from Cloudinary:', publicId)
            return result
        } catch (error) {
            logger.error('Cloudinary delete error:', error)
            throw error
        }
    },

    /**
     * Delete multiple files from Cloudinary
     * @param {string[]} publicIds - Array of public IDs to delete
     * @param {string} resource_type - 'image', 'video', or 'raw'
     * @returns {Promise<Object>} Deletion result
     */
    async deleteFiles(publicIds, resource_type = 'image') {
        try {
            const result = await cloudinary.api.delete_resources(publicIds, {
                resource_type
            })
            logger.info('Files deleted from Cloudinary:', publicIds.length)
            return result
        } catch (error) {
            logger.error('Cloudinary bulk delete error:', error)
            throw error
        }
    },

    /**
     * Generate a signed upload URL for client-side uploads
     * @param {Object} options - Upload options
     * @returns {Object} Signed URL and timestamp
     */
    generateUploadSignature(options = {}) {
        const {
            folder = 'uploads',
            resource_type = 'auto',
            timestamp = Math.round(new Date().getTime() / 1000)
        } = options

        const params = {
            folder,
            resource_type,
            timestamp
        }

        const signature = cloudinary.utils.api_sign_request(
            params,
            config.cloudinary.apiSecret
        )

        return {
            signature,
            timestamp,
            folder,
            resource_type
        }
    }
}

