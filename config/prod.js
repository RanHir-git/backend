export default {
    dbURL: process.env.MONGODB_URI || '',
    dbName: process.env.DB_NAME || 'marshmello online',
    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
        apiKey: process.env.CLOUDINARY_API_KEY || '',
        apiSecret: process.env.CLOUDINARY_API_SECRET || ''
    }
}


