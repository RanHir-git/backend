import 'dotenv/config'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { ObjectId } from 'mongodb'

import { dbService } from '../services/db.service.js'
import { logger } from '../services/logger.service.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function loadJson(relativePath) {
  const filePath = path.resolve(__dirname, '..', relativePath)
  const data = await fs.readFile(filePath, 'utf8')
  return JSON.parse(data)
}

function reviveIds(docs) {
  return docs.map(doc => {
    if (!doc._id) return doc
    
    // Handle MongoDB extended JSON format { $oid: "..." }
    if (doc._id.$oid) {
      return { ...doc, _id: new ObjectId(doc._id.$oid) }
    }
    // Handle string ID format (new format)
    else if (typeof doc._id === 'string') {
      return { ...doc, _id: new ObjectId(doc._id) }
    }
    // If already an ObjectId, keep it
    return doc
  })
}

function reviveObjectId(doc, fieldName) {
  if (doc[fieldName] && doc[fieldName].$oid) {
    return { ...doc, [fieldName]: new ObjectId(doc[fieldName].$oid) }
  }
  return doc
}

async function seed() {
  try {
    const boardCollection = await dbService.getCollection('board')
    const userCollection = await dbService.getCollection('user')

    const boardsJson = await loadJson('data/boards.json')
    const usersJson = await loadJson('data/users.json')

    const boards = reviveIds(boardsJson)
    const users = reviveIds(usersJson)

    await boardCollection.deleteMany({})
    await userCollection.deleteMany({})

    if (boards.length) await boardCollection.insertMany(boards)
    if (users.length) await userCollection.insertMany(users)

    logger.info(
      `Seeded DB with ${boards.length} boards, ${users.length} users from JSON files`
    )
  } catch (err) {
    logger.error('Failed seeding DB', err)
    process.exitCode = 1
  } finally {
    // Let Node exit once connections are idle
    setTimeout(() => process.exit(), 100)
  }
}

seed()


