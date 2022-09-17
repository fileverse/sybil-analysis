const Axios = require('axios');
const { Donation } = require('../../models');
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
        agenda.schedule('in 10 seconds', jobTypes.GET_ZKSYNC_TXNS, {
            address,
            offset: offset + limit,
            limit,
        });
    };
    const allPromises = data.map(async (dataPoint) => {
        if (dataPoint.tx.type === 'Transfer') {
            const record = await Donation.findOne({ txn_hash: dataPoint.hash });
            if (record) {
                return;
            }
            const donationObject = {};
            donationObject.raw_data = dataPoint;
            donationObject.to = dataPoint.tx.to;
            donationObject.from = dataPoint.tx.from;
            donationObject.amount = dataPoint.tx.amount;
            donationObject.token = dataPoint.tx.token;
            donationObject.chain = 'ZKSYNC';
            donationObject.txn_hash = dataPoint.hash;
            donationObject.zksync_account_id = dataPoint.tx.accountId;
            donationObject.commited_at = dataPoint.tx.validUntil;
            donationObject.executed_at = dataPoint.created_at;
            const donation = new Donation(donationObject);
            await donation.save();
        }
    });
    console.log(allPromises);
    await Promise.all(allPromises);
    console.log('Done!');
}
