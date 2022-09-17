/* eslint-disable no-process-exit */
require('../utils/database');
const { Account } = require('../models');
const Beacon = require('../utils/beacon');

const PolygonBeacon = new Beacon({ chain: 'polygon' });
const EthereumBeacon = new Beacon({ chain: 'ethereum' });

async function getBatch(offset, limit) {
  const accounts = await Account.find().skip(offset).limit(limit);
  return accounts;
}

function getActivityPolygon(address) {
  return PolygonBeacon.confirmActivity(address);
}

function getActivityEthereum(address) {
  return EthereumBeacon.confirmActivity(address);
}

function getActivityZkSync(address) {
  return true;  
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class Script {
  static async run() {
    const totalAccounts = await Account.find().count();
    const limit = 1;
    for (let i = 0; i < totalAccounts; i++) {
        console.log("account number: ", i);
        console.log('percentage done: ', parseInt((i / totalAccounts) * 100, 10));
        const offset = limit * i;
        const currentBatch = await getBatch(offset, limit);
        const allPromises = currentBatch.map(async (elem) => {
          console.log(elem);
            const account = elem;
            if (elem.active_chains.length === 3) return;
            const activity = [];
            const activityPromises = ['ZKSYNC', 'POLYGON', 'ETHEREUM'].map(async (elem) => {
              try{
                let active = false;
                if (elem === 'ZKSYNC') {
                  active = await getActivityZkSync(account.main_address);
                }
                if (elem === 'POLYGON') {
                  active = await getActivityPolygon(account.main_address);
                }
                if (elem === 'ETHEREUM') {
                  active = await getActivityEthereum(account.main_address);
                }
                if (active) {
                  activity.push(elem);
                }
              } catch(e) {
                console.log(e);
              }
            });
            await Promise.all(activityPromises);
            console.log('activity: ', activity);
            await Account.findOneAndUpdate({ main_address: account.main_address.toLowerCase() }, { $addToSet: { active_chains: activity } });
        });
        await Promise.all(allPromises);
        await sleep(500);
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
