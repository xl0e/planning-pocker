import express from 'express'
import { body, validationResult } from 'express-validator'
import { v1 } from 'uuid'
import _ from 'lodash'

const cookieMaxAge = 365250*24*3600

var Router = express.Router()

const renderPickUsername = function (req, res, data) {
  let userid = req.cookies['userid']
  if (!userid) {
    res.cookie('userid', v1(), { maxAge: cookieMaxAge })
  }
  res.render('pick-username', {
    body: req.body,
    redirect: req.path,
    ...data
  })
}

const UsernameChecker = function (req, res, next) {
  let username = req.cookies['username']
  if (req.method === 'GET' && !username) {
    renderPickUsername(req, res, {})
  } else {
    next()
  }
}

Router.get('/pick-username', function (req, res) {
  renderPickUsername(req, res, {
    username: req.cookies['username'],
    redirect: req.query.redirect || '/'
  })
})

Router.post('/pick-username', 
  body('username').isLength({min: 3}),  
  function (req, res) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      let errorObj = {}
      _.each(errors.errors, e => errorObj[e.param] = e)
      console.log(errorObj)
      renderPickUsername(req, res, {
        errors: errorObj,
        username: req.body.username,
        redirect: req.body.redirect
      })
    } else {
      const redirect = req.body.redirect || '/'
      res.cookie('username', req.body.username, { maxAge: cookieMaxAge })
        .redirect(302, redirect)
    }
  })

export { UsernameChecker }

export default Router