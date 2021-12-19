import express from 'express'
import { body, validationResult } from 'express-validator'
import { v1 } from 'uuid'

import Session from '../service/sessions.js'
import VotingSystem from '../service/votingSystem.js'
import Socket from '../service/socket.js' 
import _ from 'lodash'
import { notNull } from '../utils.js'

var Router = express.Router()

async function checkSession (id, req, res) {
  notNull(id)
  const session = await Session.findById(id)
  if (!session) {
    res.render('404', {
      username: req.cookies['username'],
      message: 'Session was not found. May be it\'s expired?' 
    })
    return false
  }
  return session
}

Router.get('/my-sessions', async function (req, res, data) {
  const username = req.cookies['username']
  const userid = req.cookies['userid']
  notNull(userid)
  let userSessions = await Session.findAll(userid)
  res.render('my-sessions', {
    title: 'My sessions',
    userid: userid,
    username: username,
    userSessions: userSessions
  })
})

Router.get('/start-vote/:id', async function (req, res) {
  let id = req.params.id
  const userid = req.cookies['userid']
  notNull(id)
  notNull(userid)
  await Session.start(id, userid)
  Socket.triggerReload(id)
  res.redirect(302, `/session/${id}`)  
})

Router.get('/reveal-votes/:id', async function (req, res) {
  let id = req.params.id
  const userid = req.cookies['userid']
  notNull(id)
  notNull(userid)
  await Session.revealVotes(id, userid)
  Socket.triggerReload(id)
  res.redirect(302, `/session/${id}`)  
})

Router.get('/vote/:id/:vote', async function (req, res) {
  const id = req.params.id
  const userid = req.cookies['userid']
  notNull(id)
  notNull(userid)
  notNull(req.params.vote)
  await Session.addVote(id, userid, req.params.vote)
  Socket.triggerReload(id)
  res.redirect(302, `/session/${id}`)  
})

Router.get('/delete-session/:id', async function (req, res) {
  let id = req.params.id
  let userid = req.cookies['userid']
  let redirect = req.query.redirect || '/'
  notNull(id)
  notNull(userid)
  await Session.deleteById(id, userid)
  Socket.triggerReload(id)
  res.redirect(302, redirect)  
})

Router.get('/drop-user/:id', async function (req, res) {
  let id = req.params.id
  notNull(id)
  await Session.deleteVoter(id, req.query.user)
  Socket.triggerReload(id)
  res.redirect(302, `/session/${id}`)
})

Router.get('/leave-session/:id', async function (req, res) {
  let id = req.params.id
  notNull(id)
  let userid = req.cookies['userid']
  await Session.deleteVoter(id, userid)
  Socket.triggerReload(id)
  res.redirect(302, '/')
})

Router.get('/session/:id', async function (req, res) {
  let id = req.params.id
  notNull(id)
  const username = req.cookies['username']
  notNull(username)
  let session = await checkSession(id, req, res)
  if (!session) {
    return
  }
  const userid = req.cookies['userid']
  notNull(userid)
  let updatedVoters = await Session.addVoter(id, userid, username)
  if (updatedVoters) {
    console.log('Adding voter', userid, username)
    Socket.triggerReload(id)
    session.voters = updatedVoters
  }
  const votingSystem = await VotingSystem.findById(session.votingSystem)
  let currentUser = _.find(session.voters, u => u.id === userid)
  res.render('session', {
    title: session.name,
    session: session,
    userid: userid,
    username: username,
    isOwner: (userid === session.owner),
    canDropVoter: (userid === session.owner) && !session.reveal,
    votingSystem: votingSystem,
    me: currentUser
  })
})

Router.post('/session', 
  body('sessionName').isLength({min: 3}),
  async function (req, res) {
    let userid = req.cookies['userid']
    let username = req.cookies['username']
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      let errorObj = {}
      _.each(errors.errors, e => errorObj[e.param] = e)
      return res.render('index', {
          body: req.body,
          errors: errorObj,
          votingSystems: await VotingSystem.find(userid),
          userid: userid,
          username: username
        })
    }
    let session = {
      id: v1(),
      name: req.body.sessionName,
      votingSystem: req.body.votingSystem,
      owner: userid,
      started: true
    }
    await Session.create(session)
    console.log(`/session/${session.id}`)
    res
      .redirect(`/session/${session.id}`)
  })


export default Router