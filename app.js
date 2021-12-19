import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'

import configureHandlebars from './configure-handlebars.js'
import Socket from './service/socket.js'
import SessionRoute from './routes/session.js'
import IndexRoute from './routes/index.js'
import VotingRoute from './routes/voting.js'
import UserRoute, { UsernameChecker } from './routes/user.js'
import _ from 'lodash'

var app = express()
configureHandlebars(app)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(cookieParser('secret-key'))

const server = http.createServer(app)
Socket.setServer(new Server(server))

app.use('/public', express.static('public'))
app.use('/', UsernameChecker, 
  SessionRoute, 
  VotingRoute, 
  UserRoute, 
  IndexRoute)

server.listen(3000, () => {
  console.log('listening on *:3000');
})