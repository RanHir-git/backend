import Cryptr from 'cryptr'
import bcrypt from 'bcrypt'

import { userService } from '../user/user.service.js'
import { logger } from '../../services/logger.service.js'

export const authService = {
    signup,
    login,
    loginWithGoogle,
    getLoginToken,
    validateToken
}

const cryptr = new Cryptr(process.env.SECRET1 || 'Secret-Puk-1234')

async function login(email, password) {
    logger.debug(`auth.service - login with email: ${email}`)

    const user = await userService.getByEmail(email)
    if (!user) throw new Error('Invalid email or password')

    const match = await bcrypt.compare(password, user.password)
    if (!match) throw new Error('Invalid email or password')

    delete user.password
    return user
}

async function signup(email, password, fullname, imgUrl) {
    logger.debug(`auth.service - signup with email: ${email}`)

    if (!email || !password || !fullname) {
        throw new Error('Missing details')
    }

    const saltRounds = 10
    const hash = await bcrypt.hash(password, saltRounds)

    return userService.add({
        email,
        password: hash,
        fullname,
        imgUrl,
        authProvider: 'local',
        googleId: null
    })
}

async function loginWithGoogle({ email, fullname, googleId, imgUrl }) {
    logger.debug(`auth.service - Google login: ${email}`)

    if (!email || !googleId) {
        throw new Error('Missing Google user details')
    }

    let user = await userService.getByEmail(email)

    if (!user) {
        user = await userService.add({
            email,
            fullname,
            googleId,
            imgUrl,
            authProvider: 'google',
            password: null
        })
    }

    delete user.password
    return user
}

function getLoginToken(user) {
    const userInfo = {
        _id: user._id,
        fullname: user.fullname,
        isAdmin: user.isAdmin
    }

    return cryptr.encrypt(JSON.stringify(userInfo))
}

function validateToken(loginToken) {
    try {
        const json = cryptr.decrypt(loginToken)
        return JSON.parse(json)
    } catch (err) {
        logger.warn('Invalid login token')
        return null
    }
}
