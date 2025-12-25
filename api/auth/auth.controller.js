import { authService } from './auth.service.js'
import { logger } from '../../services/logger.service.js'

export async function login(req, res) {

    const { email } = req.body
    // const { email, password } = req.body
    try {
        const user = await authService.login(email)
        // const user = await authService.login(email, password)
        const loginToken = authService.getLoginToken(user)
        //  console.log(user);
         logger.info('User login: ', user)
         res.cookie('loginToken', loginToken, { sameSite: 'None', secure: true })
         
         res.json(user)
        } catch (err) {
            logger.error('Failed to Login ' + err)
            res.status(401).send({ err: 'Failed to Login' })
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

        res.cookie('loginToken', loginToken, { sameSite: 'None', secure: true })
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