import db from '../db/db.js'
import _ from 'lodash'

const collection = db.collection('sessions')

const Session = {}

Session.create = async function (session) {
  await collection.insertOne(session)
  return session
}

Session.findById = async function (id, owner) {
  let filter = {id: id}
  if (owner) {
    filter.owner = owner
  }
  return await collection.findOne(filter)
}

Session.getVoters = async function (id) {
  let session = await Session.findById(id)
  if (session) {
    return session.voters || []
  } 
  return []
} 

Session.addVoter = async function (id, voterid, username) {
  let voters = await Session.getVoters(id)
  let user = _.find(voters, u => u.id === voterid) || {}
  if (!user.id || user.name !== username) {
    if (!user.id) {
      user.id = voterid
      voters.push(user)
    }
    user.name = username
    await collection.updateOne({id: id}, { $set: { voters: voters } })
    return voters
  }
  return false
}

Session.findAll = async function (owner) {
  return await collection.find({owner: owner}).toArray()
}

Session.deleteById = async function (id, owner) {
  await collection.deleteOne({owner: owner, id: id})
}

Session.start = async function (id, owner) {
  let voters = await Session.getVoters(id)
  _.each(voters, u => u.vote = '')
  await collection.updateOne({ id: id, owner: owner }, { $set: { started: true, reveal: false, voters: voters } })
}

Session.addVote = async function (id, voterid, vote) {
  let voters = await Session.getVoters(id)
  let user = _.find(voters, u => u.id === voterid)
  if (user) {
    user.vote = vote
  }
  await collection.updateOne({ id: id }, { $set: { voters: voters } })
}

Session.revealVotes = async function (id, owner) {
  let session = await Session.findById(id, owner)
  if (session) {
    let agg = Session.aggregate(session)
    await collection.updateOne(
      { id: id, owner: owner }, 
      { $set: { started: false, reveal: true, result: agg } }
    )
  }
}

Session.deleteVoter = async function (id, voterid) {
  let voters = await Session.getVoters(id)
  _.remove(voters, u => u.id === voterid)
  await collection.updateOne({ id: id }, { $set: { voters: voters } })
}

Session.aggregate = function (session) {
  let voters = session.voters || []
  let result = {}
  let total = 0
  _.each(voters, u => {
    if (u.vote) {
      total++
      let res = result[u.vote] || {}
      res.vote = u.vote
      res.count = (res.count || 0) + 1
      result[u.vote] = res
    }
  })
  for (const v in result) {
    let o = result[v]
    o.total = total
    o.share = (o.count / total * 100).toFixed(2)
  }
  return Object.values(result)
}

Session.deleteAllByVoting = async function (votingid, owner) {
  await collection.deleteMany({ owner: owner, votingSystem: votingid })
}

export default Session