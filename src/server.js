const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const config = require('config');
const passport = require('passport');
const Sequelize = require('sequelize');
const { initialize } = require('./db/index');

// Start Express
const app = express();
app.use(express.static(`${__dirname}/public`));
app.use(bodyParser.json());
app.use(passport.initialize());

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // intercept OPTIONS method
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// load passport strategies
const localSignupStrategy = require('./passport/local-signup');
const localLoginStrategy = require('./passport/local-login');
passport.use('local-signup', localSignupStrategy);
passport.use('local-login', localLoginStrategy);

// routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
// pass the authentication checker middleware
const authCheckMiddleware = require('./middleware/auth-check');
// app.use('/api', authCheckMiddleware);
const userRoutes = require('./routes/user');
app.use('/api', authCheckMiddleware, userRoutes);

async function startListening() {
  const host = config.get('server.host');
  const port = config.get('server.port');
  app.listen(port, () => {
    console.log('App listening at http://%s:%s', host, port);
  });
}

// createRoutes(app, path.join(__dirname, 'routes'));

app.get('/*', (request, response) => {
  response.sendFile(path.join(__dirname, '../public/index.html'));
});

async function start() {
  try {
    // Install middlewares and routes
    // Connect and start DB
    const sequelize = new Sequelize(
      config.get('mysql.database'),
      config.get('mysql.user'),
      config.get('mysql.password'),
      {
        host: config.get('mysql.host'),
        port: config.get('mysql.port'),
        dialect: 'mysql'
      }
    );
    await initialize(sequelize);
  } catch (e) {
    console.error(e);
  }
  // Start listening
  return await startListening();
}

start();
