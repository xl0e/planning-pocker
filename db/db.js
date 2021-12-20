import { MongoClient } from 'mongodb'

// Connection URL
const mongoHost = process.env.MONGODB_HOST || 'localhost'
const mongoPort = process.env.MONGODB_PORT || '27017'

const url = `mongodb://${mongoHost}:${mongoPort}`
const client = new MongoClient(url)

// Database Name
const dbName = 'planningPocker'

const getDB = async function () {
  await client.connect()
  console.log('Connected')
  const db = await client.db(dbName)
  return db
}

const db = await getDB()

export default {
  collection: function (col) {
    return db.collection(col)
  }
}