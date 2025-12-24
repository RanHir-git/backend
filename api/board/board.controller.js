import { boardService } from './board.service.js'
import { logger } from '../../services/logger.service.js'

export async function getBoard(req, res) {
  try {
    const board = await boardService.getById(req.params.id)
    res.send(board)
  } catch (err) {
    logger.error('Failed to get board', err)
    res.status(500).send({ err: 'Failed to get board' })
  }
}

export async function getBoards(req, res) {
  try {
    const filterBy = {
      txt: req.query?.txt || '',
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
    console.log('Deleting board with id:', req.params.id)
    await boardService.remove(req.params.id)
    res.send({ msg: 'Deleted successfully' })
  } catch (err) {
    logger.error('Failed to delete board', err)
    res.status(500).send({ err: 'Failed to delete board' })
  }
}

export async function updateBoard(req, res) {
  try {
    const board = req.body
    // Ensure the _id from params matches the body _id
    board._id = req.params.id
    logger.debug(`updateBoard - received board ID from params: ${req.params.id}, type: ${typeof req.params.id}`)
    logger.debug(`updateBoard - board._id before update: ${board._id}, type: ${typeof board._id}`)
    const savedBoard = await boardService.update(board)
    res.send(savedBoard)
  } catch (err) {
    logger.error('Failed to update board', err)
    res.status(500).send({ err: 'Failed to update board', details: err.message })
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

