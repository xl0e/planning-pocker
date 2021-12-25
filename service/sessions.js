import db from '../db/db.js'
import _ from 'lodash'

const collection = db.collection('sessions')
const maxVotersPerSession = process.env.MAX_VOTERS_PER_SESSION || 2

class Session {

  async create (session) {
    session.modified = new Date()
    await collection.insertOne(session)
    return session
  }

  async findById (id, owner) {
    let filter = {id: id}
    if (owner) {
      filter.owner = owner
    }
    return await collection.findOne(filter)
  }

  async getVoters (id) {
    let session = await this.findById(id)
    if (session) {
      return session.voters || []
    } 
    return []
  } 

  async addVoter (id, voterid, username) {
    let voters = await this.getVoters(id)
    let user = _.find(voters, u => u.id === voterid) || {}

    if (!user.id || user.name !== username) {
      if (!user.id) {
        user.id = voterid
        if (voters.length > maxVotersPerSession) {
          throw new Error('Max voters per session limit is reached')
        }
        voters.push(user)
      }
      user.name = username
      await collection.updateOne({id: id}, { $set: { voters: voters, modified: new Date() } })
      return voters
    }
    return false
  }

  async findAll (owner) {
    return await collection.find({owner: owner}).toArray()
  }

  async deleteById (id, owner) {
    await collection.deleteOne({owner: owner, id: id})
  }

  async start (id, owner) {
    let voters = await this.getVoters(id)
    _.each(voters, u => u.vote = '')
    await collection.updateOne({ id: id, owner: owner }, { $set: { started: true, reveal: false, voters: voters, modified: new Date() } })
  }

  async addVote (id, voterid, vote) {
    let voters = await this.getVoters(id)
    let user = _.find(voters, u => u.id === voterid)
    if (user) {
      user.vote = vote
    }
    await collection.updateOne({ id: id }, { $set: { voters: voters, modified: new Date() } })
  }

  async revealVotes (id, owner) {
    let session = await this.findById(id, owner)
    if (session) {
      let agg = this.aggregate(session)
      await collection.updateOne(
        { id: id, owner: owner }, 
        { $set: { started: false, reveal: true, result: agg, modified: new Date() } }
      )
    }
  }

  async deleteVoter (id, voterid) {
    let voters = await this.getVoters(id)
    _.remove(voters, u => u.id === voterid)
    await collection.updateOne({ id: id }, { $set: { voters: voters, modified: new Date() } })
  }

  aggregate (session) {
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

  async deleteAllByVoting (votingid, owner) {
    await collection.deleteMany({ owner: owner, votingSystem: votingid })
  }
}

export default new Session()