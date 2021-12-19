import sessions from '../service/sessions.js'
import express from 'express'
import votingSystems from '../service/votingSystem.js'
import _ from 'lodash'

var router = express.Router()

router.get('/', async function (req, res) {
  let userid = req.cookies['userid']
  let username = req.cookies['username']
  let userSessions = await sessions.findAll(userid)
  res.render('index', {
    title: 'Create session',
    votingSystems: await votingSystems.find(userid),
    userid: userid,
    username: username,
    userSessions: userSessions
  })
})

export default router