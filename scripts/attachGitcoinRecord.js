/* eslint-disable no-process-exit */
require('../utils/database');
const { Account } = require('../models');
const gitcoinData = require('../data/gitcoinData.json');

function getBatch(array, offset, limit) {
    const batch = array.slice(offset, offset + limit);
    return batch;
} 

class Script {
  static async run() {
    const limit = 100;
    const batch = Math.ceil(gitcoinData.addresses.length / limit);
    for (let i = 0; i < batch; i++) {
        const offset = limit * i;
        const currentBatch = getBatch(gitcoinData.addresses, offset, limit);
        const allPromises = currentBatch.map(async (elem) => {
            const address = elem[0];
            // const account = await Account.findOne({ main_address: address.toLowerCase() });
            await Account.findOneAndUpdate({ main_address: address.toLowerCase() }, { $set: { in_gitcoin_list: true } });
        });
        await Promise.all(allPromises);
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
