const agenda = require('./agenda');

require('./utils/database');

async function graceful() {
  await agenda.stop();
  // eslint-disable-next-line no-process-exit
  process.exit(0);
}

(async function () {
  try {
    await agenda.start();
    require('./agenda/jobs/getZkSyncTxns');
    require('./agenda/jobs/extractAccountsFromDonation');
    console.log('started cron job successfully');
  } catch (err) {
    console.log(err.stack);
    await graceful();
  }
})();

process.on('SIGTERM', graceful);
process.on('SIGINT', graceful);
