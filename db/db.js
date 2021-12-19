import { MongoClient } from 'mongodb'

// Connection URL
const url = 'mongodb://localhost:27017'
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