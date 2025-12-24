import express from 'express'

import { requireAuth } from '../../middlewares/requireAuth.middleware.js'
import { getBoard, getBoards, deleteBoard, updateBoard, addBoard } from './board.controller.js'

export const boardRoutes = express.Router()

boardRoutes.get('/', getBoards)
boardRoutes.get('/:id', getBoard)
boardRoutes.post('/',  addBoard)
boardRoutes.put('/:id', updateBoard)
boardRoutes.delete('/:id', deleteBoard)
