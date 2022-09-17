const config = require('../config');
const Agenda = require('agenda');

const agenda = new Agenda({
  db: {
    address: config.MONGOURI,
  },
  defaultConcurrency: config.AGENDA_DEFAULT_CONCURRENCY || 1,
  defaultLockLimit: config.AGENDA_DEFAULT_CONCURRENCY || 1,
});

module.exports = agenda;
