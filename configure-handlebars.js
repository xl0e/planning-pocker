import expressHandlebars from 'express-handlebars'
import Handlebars from 'handlebars'
import dateFormat from 'dateformat'

export default function (app) {
  var hbs = expressHandlebars.create({ 
    extname: '.hbs',
    encoding: 'utf8'
  })

  Handlebars.registerHelper('ifEq', function(v1, v2, options) {
    if(v1 === v2) {
      return options.fn(this)
    }
    return options.inverse(this)
  })

  Handlebars.registerHelper('formatDate', function(datetime, format) {
    return dateFormat(datetime, format)
  })

  app.engine('.hbs', hbs.engine)
  app.set('view engine', '.hbs')
}


