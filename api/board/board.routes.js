import express from 'express'

import { requireAuth } from '../../middlewares/requireAuth.middleware.js'
import {
  getBoard,
  getBoards,
  deleteBoard,
  updateBoard,
  addBoard,
} from './board.controller.js'

export const boardRoutes = express.Router()

boardRoutes.get('/', requireAuth, getBoards)
boardRoutes.get('/:id', requireAuth, getBoard)
boardRoutes.post('/', requireAuth, addBoard)
boardRoutes.put('/:id', requireAuth, updateBoard)
boardRoutes.delete('/:id', requireAuth, deleteBoard)
