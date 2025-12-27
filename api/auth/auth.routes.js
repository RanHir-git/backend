import express from 'express'
import { login, signup, logout, loginWithGoogle } from './auth.controller.js'

export const authRoutes = express.Router()

authRoutes.post('/login', login)
authRoutes.post('/signup', signup)
authRoutes.post('/google', loginWithGoogle)
authRoutes.post('/logout', logout)