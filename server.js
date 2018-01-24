/* eslint global-require: "off", no-console: "off" */
const app = require('express')()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const nextJs = require('next')
const co = require('co')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const session = require('express-session')

const routes = require('./routes')
const { User } = require('./models')
const serverSocket = require('./socket/server')

const DEV = process.env.NODE_ENV !== 'production'
const PORT = 3000

const nextApp = nextJs({ dev: DEV })
const handler = routes.getRequestHandler(nextApp)

/* eslint-disable func-names */
co(function* () {
  // Initialize the Next.js app
  yield nextApp.prepare()

  // Configure express to expose a REST API
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(cookieParser())
  app.use(session({
    secret: 'jkf94u8ui35gknchFJKHEJOHEF)*3f',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
  }))

  // Websocket stuff
  io.on('connection', () => console.log('connection!!'))
  serverSocket(io)

  // Shibboleth auth
  app.use((req, res, next) => {
    // Get the user's NetID based on the "eppn" field
    // Temporarily disable this in dev
    let netid
    if (DEV) {
      netid = 'dev'
    } else {
      const email = req.get('eppn')
      if (email.indexOf('@') === -1) { throw new Error('No login found.') }
      [netid] = email.split('@')
    }

    // Check if the user has a session, and verify the netid in the session;
    // otherwise, create the session
    if (req.session.user && req.session.user.netid === netid) {
      next()
    } else {
      User.findOrCreate({ where: { netid } }).spread((user) => {
        req.session.user = user
        next()
      })
    }
  })

  // API routes
  app.use('/api/users', require('./routes/users'))
  app.use('/api/courses', require('./routes/courses'))
  app.use('/api/queues', require('./routes/queues'))
  app.use('/api/questions', require('./routes/questions'))
  app.use('/api/courses/:courseId/queues', require('./routes/queues'))
  app.use('/api/courses/:courseId/queues/:queueId/questions', require('./routes/questions'))
  app.use('/api/queues/:queueId/questions', require('./routes/questions'))

  app.use(handler)

  server.listen(PORT)
  console.log(`Listening on ${PORT}`)
}).catch(error => console.error(error.stack))