import { authService } from './auth.service.js'
import { logger } from '../../services/logger.service.js'

export async function login(req, res) {
    const { email } = req.body
    // const { email, password } = req.body
    
    if (!email) {
        logger.error('Login attempt with missing email')
        return res.status(400).send({ err: 'Email is required' })
    }
    
    try {
        const user = await authService.login(email)
        // const user = await authService.login(email, password)
        const loginToken = authService.getLoginToken(user)
        //  console.log(user);
        logger.info('User login: ', user)
        
        // Cookie settings for production (HTTPS) and development
        const cookieOptions = {
            httpOnly: false, // Allow JavaScript access
            secure: process.env.NODE_ENV === 'production', // Only secure in production (HTTPS)
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
        }
        
        res.cookie('loginToken', loginToken, cookieOptions)
        res.json(user)
    } catch (err) {
        logger.error('Failed to Login', err)
        const errorMessage = err.message || 'Failed to Login'
        res.status(401).send({ err: errorMessage })
    }
}
    
    export async function signup(req, res) {
    
        try {
            const userCred = req.body
            // const { email, password, fullname, imgUrl } = req.body
        
        // IMPORTANT!!! 
        // Never write passwords to log file!!!
        // logger.debug(fullname + ', ' + username + ', ' + password)
        
        const account = await authService.signup(userCred)
        // const account = await authService.signup({ email, password, fullname, imgUrl })
        logger.debug(`auth.route - new account created: ` + JSON.stringify(account))
        
        const user = await authService.login(userCred.email)
        // const user = await authService.login(email, password)
        const loginToken = authService.getLoginToken(user)

        // Cookie settings for production (HTTPS) and development
        const cookieOptions = {
            httpOnly: false, // Allow JavaScript access
            secure: process.env.NODE_ENV === 'production', // Only secure in production (HTTPS)
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
        }
        
        res.cookie('loginToken', loginToken, cookieOptions)
        res.json(user)
    } catch (err) {
        logger.error('Failed to signup ' + err)
        if (err.message === 'Email taken') {
            res.status(400).send({ err: 'Email taken' })
        } else {
            res.status(500).send({ err: 'Failed to signup' })
        }
    }
}

export async function logout(req, res){
    try {
        res.clearCookie('loginToken')
        res.send({ msg: 'Logged out successfully' })
    } catch (err) {
        res.status(500).send({ err: 'Failed to logout' })
    }
}