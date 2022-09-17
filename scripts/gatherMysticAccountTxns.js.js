/* eslint-disable no-process-exit */
require('../utils/database');
const agenda = require('../agenda');
const jobTypes = require('../agenda/jobType');
const { Account } = require('../models');

async function getAccount(criteria, offset, limit) {
  const accounts = await Account.find(criteria).skip(offset).limit(limit).lean();
  return accounts[0];
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class Script {
  static async run() {
    const criteria = { in_gitcoin_list: { $ne: true } };
    const totalAccounts = await Account.find(criteria).count();
    for (let i = 5; i < totalAccounts; i++) {
        console.log("account number: ", i, " out of ", totalAccounts);
        console.log('percentage done: ', parseInt((i / totalAccounts) * 100, 10));
        const currentAccount = await getAccount(criteria, i, 1);
        console.log(currentAccount);
        agenda.schedule('now', jobTypes.GET_ZKSYNC_TXNS, {
          address: currentAccount.main_address,
          offset: 0,
          limit: 100,
        });
        await sleep(60000);
    }
  }
}

(async () => {
  try {
    console.log('Script run started!');
    await Script.run();
    console.log('Script run complete!');
    process.exit(0);
  } catch (err) {
    console.error(err.stack);
    process.exit(1);
  }
})();

