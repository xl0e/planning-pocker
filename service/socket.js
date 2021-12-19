import { notNull } from "../utils.js"
import _ from "lodash"

export default {
  setServer: function (server) {
    this.io = server
    this.io.on('connection', socket => {
      socket.on('disconnect', function () {
      })
    })
  },
  triggerReload: function (id) {
    notNull(id)
    this.io.emit('reload', { session: id })
  }
}