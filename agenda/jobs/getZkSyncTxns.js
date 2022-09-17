const Axios = require('axios');
const { Txn } = require('../../models');
const agenda = require('../index');
const jobTypes = require('../jobType');

agenda.define(jobTypes.GET_ZKSYNC_TXNS, async (job, done) => {
  const { address, offset, limit } = job.attrs.data;
  try {
    await run({ address, offset, limit });
    done();
  } catch (err) {
    console.error(
      'Error removing job from collection',
      jobTypes.GET_ZKSYNC_TXNS,
      address,
      offset,
      limit,
    );
    done(err);
  }
});

async function run({ address, offset, limit }) {
    const urlTxn = `https://api.zksync.io/api/v0.1/account/${address}/history/${offset}/${limit}`;
    const { data } = await Axios.get(urlTxn).catch((e) => {
        console.error(`Request to ${e.config.url} failed with status code ${e.response.status}`);
        return { data: null };
    });
    console.log(data);
    if (!data) {
        return;
    }
    if (data.length === limit) {
        agenda.schedule('in a minute', jobTypes.GET_ZKSYNC_TXNS, {
            address,
            offset: offset + limit,
            limit,
        });
    };
    const allPromises = data.map(async (dataPoint) => {
        if (dataPoint.tx.type === 'Transfer') {
            const record = await Txn.findOne({ txn_hash: dataPoint.hash });
            if (record) {
                return;
            }
            const txnObject = {};
            txnObject.raw_data = dataPoint;
            txnObject.to = dataPoint.tx.to;
            txnObject.from = dataPoint.tx.from;
            txnObject.amount = dataPoint.tx.amount;
            txnObject.token = dataPoint.tx.token;
            txnObject.chain = 'ZKSYNC';
            txnObject.txn_hash = dataPoint.hash;
            txnObject.zksync_account_id = dataPoint.tx.accountId;
            txnObject.commited_at = dataPoint.tx.validUntil;
            txnObject.executed_at = dataPoint.created_at;
            const timestamp = (new Date(dataPoint.created_at)).getTime();
            txnObject.executed_at_timestamp = timestamp;
            const txn = new Txn(txnObject);
            await txn.save();
        }
    });
    console.log(allPromises);
    await Promise.all(allPromises);
    console.log('Done!');
}
