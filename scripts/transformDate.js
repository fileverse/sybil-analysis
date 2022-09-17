/* eslint-disable no-process-exit */
require('../utils/database');
const { Donation } = require('../models');

class Script {
  static async run() {
    const totalTxns = await Donation.find().count();
    const batches = Math.ceil(totalTxns / 100);
    const batchSize = 100;
    for (let i = 0; i < batches; i += 1) {
      const skip = i * batchSize;
      const limit = batchSize;
      let currentBatch = await Donation.find().skip(skip).limit(limit);
      const allPromises = currentBatch.map(async (elem) => {
        const timestamp = (new Date(elem.executed_at)).getTime();
        elem.executed_at_timestamp = timestamp;
        await elem.save();
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
