/* eslint-disable no-process-exit */
require('../utils/database');
const { Txn, Account } = require('../models');

async function getBatch(offset, limit) {
  const txns = await Txn.find().sort({ _id: -1 }).skip(offset).limit(limit);
  return txns;
}

class Script {
  static async run() {
    const totalTxns = await Txn.find().count();
    const limit = 100;
    const batches = Math.ceil(totalTxns / limit);
    for (let i = 0; i < batches; i++) {
        console.log("account number: ", i);
        console.log('percentage done: ', parseInt((i / batches) * 100, 10));
        const offset = limit * i;
        const currentBatch = await getBatch(offset, limit);
        const allPromises = currentBatch.map(async (elem) => {
            const txn = elem;
            const { from, to } = txn;
            const fromAccount = await Account.findOne({ main_address: from.toLowerCase() });
            const mergeFromConnections = {};
            (fromAccount && fromAccount.connected_addresses || []).map(elem2 => {
              mergeFromConnections[elem2.txn_hash] = elem2;
            });
            mergeFromConnections[elem.txn_hash.toLowerCase()] = { to: to, txn_hash: txn.txn_hash };
            const mergedFromConnections = Object.values(mergeFromConnections);
            await Account.findOneAndUpdate({ main_address: from.toLowerCase() }, { $set: { connected_addresses: mergedFromConnections } });

            const toAccount = await Account.findOne({ main_address: to.toLowerCase() });
            const mergeToConnections = {};
            (toAccount && toAccount.connected_addresses || []).map(elem2 => {
              mergeToConnections[elem2.txn_hash] = elem2;
            });
            mergeToConnections[elem.txn_hash.toLowerCase()] = { to: from, txn_hash: txn.txn_hash };
            const mergedToConnections = Object.values(mergeToConnections);
            await Account.findOneAndUpdate({ main_address: to.toLowerCase() }, { $set: { connected_addresses: mergedToConnections } });
            console.log('txn: ', txn.to, ":", txn.from, ":", txn.txn_hash);
            console.log('mergedFromConnections: ', mergedFromConnections);
            console.log('mergedToConnections: ', mergedToConnections);
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
