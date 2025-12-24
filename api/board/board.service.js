import { ObjectId } from 'mongodb'
import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { utilService } from '../../services/util.service.js'

export const boardService = {
  query,
  getById,
  remove,
  update,
  add,
}

// Helper function to convert board to response format
function serializeBoard(board) {
  if (!board) return board
  // Use shortId if available, otherwise fall back to _id for backward compatibility
  const idForResponse = board.shortId || (board._id instanceof ObjectId ? board._id.toString() : board._id)
  
  return {
    ...board,
    _id: idForResponse,
    shortId: undefined // Don't expose shortId field to frontend
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

async function getById(shortId) {
  try {
    const collection = await dbService.getCollection('board')
    let board = await collection.findOne({ shortId: shortId })
    
    // Fallback to ObjectId for backward compatibility with old boards
    if (!board) {
      try {
        const objectId = ObjectId.createFromHexString(shortId)
        board = await collection.findOne({ _id: objectId })
      } catch (idErr) {
        // Not a valid ObjectId
      }
    }
    
    if (!board) {
      throw new Error(`Board not found with ID: ${shortId}`)
    }
    
    return serializeBoard(board)
  } catch (err) {
    logger.error(`while finding board ${shortId}`, err)
    throw err
  }
}

async function remove(shortId) {
  try {
    const collection = await dbService.getCollection('board')
    let result = await collection.deleteOne({ shortId: shortId })
    
    // Fallback to ObjectId for backward compatibility with old boards
    if (result.deletedCount === 0) {
      try {
        const objectId = ObjectId.createFromHexString(shortId)
        result = await collection.deleteOne({ _id: objectId })
      } catch (idErr) {
        // Not a valid ObjectId
      }
    }
    
    if (result.deletedCount === 0) {
      throw new Error(`Board not found with ID: ${shortId}`)
    }
  } catch (err) {
    logger.error(`cannot remove board ${shortId}`, err)
    throw err
  }
}

async function update(board) {
  try {
    if (!board._id) {
      throw new Error('Board _id is required')
    }
    
    if (typeof board._id !== 'string') {
      throw new Error(`Board _id must be a string`)
    }

    const shortId = board._id
    const collection = await dbService.getCollection('board')
    let existingBoard = await collection.findOne({ shortId: shortId })
    let updateQuery = { shortId: shortId }
    
    // Fallback to ObjectId for backward compatibility with old boards
    if (!existingBoard) {
      try {
        const objectId = ObjectId.createFromHexString(shortId)
        existingBoard = await collection.findOne({ _id: objectId })
        if (existingBoard) {
          updateQuery = { _id: objectId }
        }
      } catch (idErr) {
        // Not a valid ObjectId
      }
    }
    
    if (!existingBoard) {
      throw new Error(`Board not found with ID: ${board._id}`)
    }

    const boardToSave = {
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
    
    // Preserve shortId if board has one
    if (existingBoard.shortId) {
      boardToSave.shortId = shortId
    }
    
    const result = await collection.updateOne(updateQuery, { $set: boardToSave })
    
    if (result.matchedCount === 0) {
      throw new Error(`Board update failed`)
    }
    
    const updatedBoard = await collection.findOne(updateQuery)
    return serializeBoard(updatedBoard)
  } catch (err) {
    logger.error(`cannot update board ${board._id}`, err)
    throw err
  }
}

async function add(board) {
  try {
    // Generate a short ID (8 characters)
    const plainShortId = utilService.generateShortId(8)
    
    const boardToAdd = {
      shortId: plainShortId,
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

