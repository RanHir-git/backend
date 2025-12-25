import { boardService } from './board.service.js'
import { logger } from '../../services/logger.service.js'

export async function getBoard(req, res) {
  try {
    const shortId = req.params.id
    const board = await boardService.getById(shortId)
    res.send(board)
  } catch (err) {
    logger.error('Failed to get board', err)
    if (err.message.includes('not found')) {
      res.status(400).send({ err: 'Invalid board ID' })
    } else {
      res.status(500).send({ err: 'Failed to get board' })
    }
  }
}

export async function getBoards(req, res) {
  try {
    const filterBy = {
     title: req.query?.title || '',
    }
    const boards = await boardService.query(filterBy)
    res.send(boards)
  } catch (err) {
    logger.error('Failed to get boards', err)
    res.status(500).send({ err: 'Failed to get boards' })
  }
}

export async function deleteBoard(req, res) {
  try {
    const shortId = req.params.id
    await boardService.remove(shortId)
    res.send({ msg: 'Deleted successfully' })
  } catch (err) {
    logger.error('Failed to delete board', err)
    if (err.message.includes('not found')) {
      res.status(400).send({ err: 'Invalid board ID' })
    } else {
      res.status(500).send({ err: 'Failed to delete board' })
    }
  }
}

export async function updateBoard(req, res) {
  try {
    const board = req.body
    board._id = req.params.id
    const savedBoard = await boardService.update(board)
    res.send(savedBoard)
  } catch (err) {
    logger.error('Failed to update board', err)
    if (err.message.includes('not found')) {
      res.status(400).send({ err: 'Invalid board ID' })
    } else {
      res.status(500).send({ err: 'Failed to update board', details: err.message })
    }
  }
}

export async function addBoard(req, res) {
  try {
    const board = req.body
    const savedBoard = await boardService.add(board)
    res.send(savedBoard)
  } catch (err) {
    logger.error('Failed to add board', err)
    res.status(500).send({ err: 'Failed to add board' })
  }
}

