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

async function query(filterBy = {}) {
  const criteria = _buildCriteria(filterBy)
  try {
    const collection = await dbService.getCollection('board')
    var boards = await collection.find(criteria).toArray()
    return boards
  } catch (err) {
    logger.error('cannot find boards', err)
    throw err
  }
}

async function getById(boardId) {
  try {
    const collection = await dbService.getCollection('board')
    const board = await collection.findOne({ _id: ObjectId.createFromHexString(boardId) })
    return board
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
    const boardToSave = {
      _id: ObjectId.createFromHexString(board._id),
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
    const collection = await dbService.getCollection('board')
    await collection.updateOne({ _id: boardToSave._id }, { $set: boardToSave })
    return boardToSave
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
    return boardToAdd
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

