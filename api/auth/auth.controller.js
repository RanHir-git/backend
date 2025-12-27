import { authService } from './auth.service.js'
import { logger } from '../../services/logger.service.js'

export async function login(req, res) {
    try {
        const { email, password } = req.body

        const user = await authService.login(email, password)
        const loginToken = authService.getLoginToken(user)

        logger.info('User login:', user)

        res.cookie('loginToken', loginToken, {
            sameSite: 'None',
            secure: true
        })

        res.json(user)
    } catch (err) {
        logger.error('Failed to Login', err)
        res.status(401).send({ err: err.message || 'Failed to Login' })
    }
}

export async function signup(req, res) {
    try {
        const userCred = req.body
        const { email, password, fullname, imgUrl } = userCred

        const account = await authService.signup(email, password, fullname, imgUrl)
        logger.debug('New account created:', account)

        // Auto-login after signup
        const user = await authService.login(email, password)
        const loginToken = authService.getLoginToken(user)

        res.cookie('loginToken', loginToken, {
            sameSite: 'None',
            secure: true
        })

        res.json(user)
    } catch (err) {
        logger.error('Failed to signup', err)

        if (err.message === 'Email taken') {
            res.status(400).send({ err: 'Email taken' })
        } else {
            res.status(500).send({ err: 'Failed to signup' })
        }
    }
}

export async function loginWithGoogle(req, res) {
    try {
        const { email, fullname, googleId, imgUrl } = req.body

        const user = await authService.loginWithGoogle({
            email,
            fullname,
            googleId,
            imgUrl
        })

        const loginToken = authService.getLoginToken(user)

        res.cookie('loginToken', loginToken, { sameSite: 'None', secure: true })
        res.json(user)
    } catch (err) {
        logger.error('Failed Google login', err)
        res.status(401).send({ err: err.message || 'Google login failed' })
    }
}

export async function logout(req, res) {
    try {
        res.clearCookie('loginToken')
        res.send({ msg: 'Logged out successfully' })
    } catch (err) {
        res.status(500).send({ err: 'Failed to logout' })
    }
}
