export const utilService = {
    makeId,
    generateShortId,
}

function makeId(length = 5) {
    var txt = ''
    var possible =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (let i = 0; i < length; i++) {
        txt += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return txt
}

/**
 * Generate a short random ID (URL-safe)
 * @param {number} length - Length of the ID (default: 8)
 * @returns {string} Short random ID
 */
function generateShortId(length = 8) {
    // Use base62 (a-z, A-Z, 0-9) for URL-safe short IDs
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

