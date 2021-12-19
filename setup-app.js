import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import path from 'path'

export default function (app) {
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({
    extended: false
  }))
  app.use(cookieParser('secret-key'))
}


