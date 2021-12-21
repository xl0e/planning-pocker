import db from '../db/db.js'
import _ from 'lodash'
import fs from 'fs'
import { ObjectId } from 'bson'

const collection = db.collection('votingSystem')

let predefinedRaw = fs.readFileSync('service/predefined-votings.json')
const predefined = JSON.parse(predefinedRaw)

class VotingSystem {

  async find (userid) {
    let userSystems = await collection.find({ owner: userid }, { sort: { created: -1 }}).toArray()
    if (!userSystems) {
      userSystems = []
    }
    return userSystems.concat(predefined)
  }

  async findById (id) {
    let system = _.find(predefined, p => p._id === id)
    if (!system) {
      try {
      system = await collection.findOne({ _id: new ObjectId(id) })
      } catch (err) {
        console.error(err)
        system = {}
      }
    } 
    return system
  }

  async findByOwner (owner) {
    return await collection.find({ owner: owner }, { sort: { created: -1 }}).toArray()
  }

  async create (owner, data) {
    let values = data.values
      .split(',')
      .map(s => s.trim())
    let voting = {
      id: data.name,
      name: data.name + ' (' + data.values + ')',
      values: values,
      owner: owner,
      created: new Date()
    }
    await collection.replaceOne({ id: data.name, owner: owner }, voting, { upsert: true })
  }

  async delete (id, owner) {
    await collection.deleteOne({ _id: new ObjectId(id), owner: owner })
  }
}
export default new VotingSystem()