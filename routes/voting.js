import express from 'express'
import { body, validationResult } from 'express-validator'
import _ from 'lodash'
import { notNull } from '../utils.js'
import VotingSystem from '../service/votingSystem.js'
import Session from '../service/sessions.js'

var Router = express.Router()

Router.get('/my-voting-systems', async function (req, res, data) {
  const username = req.cookies['username']
  const userid = req.cookies['userid']
  notNull(userid)
  res.render('my-voting-systems', {
    title: 'My voting systems',
    votingSystems: await VotingSystem.findByOwner(userid),
    userid: userid,
    username: username
  })
})  

Router.get('/delete-voting/:id', async function (req, res) {
  let id = req.params.id
  let userid = req.cookies['userid']
  let redirect = req.query.redirect || '/'
  notNull(id)
  notNull(userid)
  await VotingSystem.delete(id, userid)
  await Session.deleteAllByVoting(id, userid)
  res.redirect(302, redirect)  
})

Router.post('/my-voting-systems', 
  body('name').isLength({min: 4}),
  body('values').isLength({min: 6}),
  async function (req, res) {
    let userid = req.cookies['userid']
    let username = req.cookies['username']
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      let errorObj = {}
      _.each(errors.errors, e => errorObj[e.param] = e)
      if (req.xhr) {
        return res.render('partials/votingform', {
          layout: false,
          body: req.body,
          errors: errorObj,
          redirect: req.body.redirect
        })
      } else {
        return res.render('index', {
            showModal: 'votingModal',
            body: req.body,
            errors: errorObj,
            votingSystems: await VotingSystem.find(userid),
            userid: userid,
            username: username,
            redirect: req.body.redirect
          })
      }
    }
    await VotingSystem.create(userid, req.body)
    res
      .header('location', req.body.redirect || '/')
      .end()
  })

export default Router