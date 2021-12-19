import db from '../db/db.js'
import _ from 'lodash'
import fs from 'fs'
import { ObjectId } from 'bson'

const collection = db.collection('votingSystem')

let predefinedRaw = fs.readFileSync('service/predefined-votings.json')
const predefined = JSON.parse(predefinedRaw)

const VotingSystem = {}

VotingSystem.find = async function (userid) {
  let userSystems = await collection.find({ owner: userid }, { sort: { created: -1 }}).toArray()
  if (!userSystems) {
    userSystems = []
  }
  return userSystems.concat(predefined)
}

VotingSystem.findById = async function (id) {
  let system = _.find(predefined, p => p._id === id)
  if (!system) {
    system = collection.findOne({ _id: new ObjectId(id) })
  } 
  return system
}

VotingSystem.findByOwner = async function (owner) {
  return await collection.find({ owner: owner }, { sort: { created: -1 }}).toArray()
}

VotingSystem.create = async function (owner, data) {
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

VotingSystem.delete = async function (id, owner) {
  await collection.deleteOne({ _id: new ObjectId(id), owner: owner })
}

export default VotingSystem