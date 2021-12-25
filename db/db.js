import { MongoClient } from 'mongodb'

// Connection URL
const url = process.env.MONGODB_CONNECTION_URL || 'mongodb://localhost:27017'

const client = new MongoClient(url)

// Database Name
const dbName = 'planningPocker'

const getDB = async function () {
  await client.connect()
  console.log('Connected to DB')
  const db = client.db(dbName)
  return db
}

const db = await getDB()

export default {
  collection: function (col) {
    return db.collection(col)
  }
}