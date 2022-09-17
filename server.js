const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const basicAuth = require('express-basic-auth');
const Agendash = require('agendash');

const config = require('./config');
const errorHandler = require('./utils/errorHandler');
const agenda = require('./agenda');

require('./database');

// Express App
const app = express();

// parse application/json
app.use(express.json());

// Use default logger for now
app.use(logger('combined'));
app.use(cors());
app.use(
  helmet({
    contentSecurityPolicy: false,
    frameguard: false,
  }),
);

app.use(
  '/dash',
  basicAuth({
    users: {
      admin: config.AGENDA_CRON_PASSWORD,
    },
    challenge: true,
  }),
  Agendash(agenda),
);

// This is to check if the service is online or not
app.use('/ping', function (req, res) {
  res.json({ reply: 'pong' });
  res.end();
});

app.use(errorHandler);

// Here you set the PORT and IP of the server
const port = config.PORT || 8001;
const ip = config.IP || '127.0.0.1';

app.listen({ port, ip }, () =>
  console.log(`🚀 Server ready at http://${ip}:${port}`),
);

module.exports = app;
