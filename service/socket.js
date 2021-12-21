import { notNull } from "../utils.js"
import _ from "lodash"
import cookie from 'cookie'

export default {
  setServer: function (server) {
    this.io = server
    this.io.on('connection', socket => {
      let cookies = cookie.parse(_.get(socket, 'handshake.headers.cookie'))
      console.log('Client connected', cookies.userid, cookies.username)
      socket.on('disconnect', function () {
      })
    })
  },
  triggerReload: function (id) {
    notNull(id)
    this.io.emit('reload', { session: id })
  }
}