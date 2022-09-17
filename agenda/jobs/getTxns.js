const Axios = require('axios');

const Account = require('./models/account').model;
const Donation = require('./models/donation').model;

const data = require('./data');
console.log(data);

require('./database');

async function getTxns(address, offset, limit) {
    // const urlTxn = `https://api.zksync.io/api/v0.1/account/${address}/history/${offset}/${limit}`;
    // const { data } = await Axios.get(urlTxn).catch((e) => {
    //     console.error(`Request to ${e.config.url} failed with status code ${e.response.status}`);
    //     return { data: null };
    // });
    console.log(data);
    const allPromises = data.map(async (dataPoint) => {
        console.log(dataPoint);
        if (dataPoint.tx.type === 'Transfer') {
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

getTxns('0x8fa7d8d79907e22ddf92cd34daacdeac56311ad6', 0, 10).catch(console.log);
