import { ObjectId } from 'mongodb'
import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'

export const boardService = {
  query,
  getById,
  remove,
  update,
  add,
}

// Helper function to convert ObjectId to string for JSON serialization
function serializeBoard(board) {
  if (!board) return board
  return {
    ...board,
    _id: board._id instanceof ObjectId ? board._id.toString() : board._id
  }
}

async function query(filterBy = {}) {
  const criteria = _buildCriteria(filterBy)
  try {
    const collection = await dbService.getCollection('board')
    var boards = await collection.find(criteria).toArray()
    return boards.map(board => serializeBoard(board))
  } catch (err) {
    logger.error('cannot find boards', err)
    throw err
  }
}

async function getById(boardId) {
  try {
    const collection = await dbService.getCollection('board')
    const board = await collection.findOne({ _id: ObjectId.createFromHexString(boardId) })
    return serializeBoard(board)
  } catch (err) {
    logger.error(`while finding board ${boardId}`, err)
    throw err
  }
}

async function remove(boardId) {
  try {
    const collection = await dbService.getCollection('board')
    await collection.deleteOne({ _id: ObjectId.createFromHexString(boardId) })
  } catch (err) {
    logger.error(`cannot remove board ${boardId}`, err)
    throw err
  }
}

async function update(board) {
  try {
    // Validate that _id is provided and is a string
    if (!board._id) {
      throw new Error('Board _id is required')
    }
    
    if (typeof board._id !== 'string') {
      logger.error(`Invalid board ID format: expected string, got ${typeof board._id}: ${JSON.stringify(board._id)}`)
      throw new Error(`Board _id must be a string, got ${typeof board._id}`)
    }

    // Convert string ID to ObjectId
    let boardId
    try {
      boardId = ObjectId.createFromHexString(board._id)
    } catch (idErr) {
      logger.error(`Invalid board ID format: ${board._id}`, idErr)
      throw new Error(`Invalid board ID format: ${board._id}`)
    }

    // Check if board exists
    const collection = await dbService.getCollection('board')
    const existingBoard = await collection.findOne({ _id: boardId })
    
    if (!existingBoard) {
      logger.error(`Board not found with ID: ${board._id}`)
      throw new Error(`Board not found with ID: ${board._id}`)
    }

    const boardToSave = {
      _id: boardId,
      title: board.title,
      isStarred: board.isStarred,
      archivedAt: board.archivedAt,
      createdBy: board.createdBy,
      style: board.style,
      labels: board.labels,
      members: board.members,
      groups: board.groups,
      activities: board.activities || [],
    }
    
    const result = await collection.updateOne({ _id: boardToSave._id }, { $set: boardToSave })
    
    if (result.matchedCount === 0) {
      logger.error(`Board update failed - no board matched ID: ${board._id}`)
      throw new Error(`Board update failed`)
    }
    
    // Return the updated board with _id as string for frontend
    return serializeBoard(boardToSave)
  } catch (err) {
    logger.error(`cannot update board ${board._id}`, err)
    throw err
  }
}

async function add(board) {
  try {
    const boardToAdd = {
      title: board.title,
      isStarred: board.isStarred || false,
      archivedAt: board.archivedAt || null,
      createdBy: board.createdBy,
      style: board.style || {
        background: {
          color: '',
          kind: '',
        },
      },
      labels: board.labels || [],
      members: board.members || [],
      groups: board.groups || [],
      activities: board.activities || [],
    }
    const collection = await dbService.getCollection('board')
    const result = await collection.insertOne(boardToAdd)
    boardToAdd._id = result.insertedId
    return serializeBoard(boardToAdd)
  } catch (err) {
    logger.error('cannot insert board', err)
    throw err
  }
}

function _buildCriteria(filterBy) {
  const criteria = {}
  if (filterBy.txt) {
    const txtCriteria = { $regex: filterBy.txt, $options: 'i' }
    criteria.$or = [
      {
        title: txtCriteria,
      },
    ]
  }
  return criteria
}

