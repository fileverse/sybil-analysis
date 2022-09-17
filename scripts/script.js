const Axios = require('axios');
const config = require('../config');

const Account = require('../models/account').model;
const Txn = require('../models/txn').model;

const data = require('./data/txns');
console.log(data);

require('../utils/database');

console.log(config.SERVICE_NAME);

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
            const txn = new Txn(txnObject);
            await txn.save();
        }
    });
    console.log(allPromises);
    await Promise.all(allPromises);
    console.log('Done!');
}

getTxns('0x8fa7d8d79907e22ddf92cd34daacdeac56311ad6', 0, 10).catch(console.log);
