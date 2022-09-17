/* eslint-disable no-process-exit */
require('../utils/database');
const { Txn, Account } = require('../models');

async function extractAccountsFromDonation(criteria, offset, limit) {
    const query = [
        {
            $match: criteria,
        },
        {
            $skip: offset,
        },
        {
            $limit: limit,
        },
        {
            $group: {
                _id: '$from',
                active_chains: {
                    $addToSet: '$chain',
                },
                donations: {
                    $push: {
                        txn_hash: '$txn_hash',
                        amount: '$amount',
                        token: '$token',
                        chain: '$chain'
                    },
                },
            },
        },
        {
            $project: {
                _id: false,
                address: '$_id',
                active_chains: 1,
                donations: 1,
            }
        }
    ];
    const extractedAcounts = await Donation.aggregate(query);
    return extractedAcounts;
}

async function addDataToAccount(accountData) {
    let foundAccount = await Account.findOne({ main_address: accountData.address });
    if (!foundAccount) {
        foundAccount = new Account({ main_address: accountData.address });
    }
    let old_active_chains = foundAccount && foundAccount.active_chains || [];
    let new_active_chains = accountData && accountData.active_chains || [];
    const chainMap = {};
    old_active_chains.forEach(elem => {
        chainMap[elem] = 1;
    });
    new_active_chains.forEach(elem => {
        chainMap[elem] = 1;
    });
    foundAccount.active_chains = Object.keys(chainMap);

    const old_donations = foundAccount && foundAccount.donations || [];
    const new_donations = accountData && accountData.donations || [];
    const donationMap = {};
    old_donations.forEach(elem => {
        donationMap[elem.txn_hash] = elem;
    });
    new_donations.forEach(elem => {
        donationMap[elem.txn_hash] = elem;
    });
    foundAccount.donations = Object.values(donationMap);
    await foundAccount.save();
}

async function processAccounts(accounts) {
    const allPromises = accounts.map(async (elem) => {
        await addDataToAccount(elem);
    });
    const data = await Promise.all(allPromises);
    console.log(data);
}

class Script {
  static async run() {
    const criteria = {};
    const totalDonations = await Donation.find(criteria).count();
    const limit = 100;
    const batches = Math.ceil(totalDonations / limit);
    for (let i = 0; i < batches; i++) {
        const offset = i * limit;
        const extractedAccounts = await extractAccountsFromDonation(criteria, offset, limit);
        await processAccounts(extractedAccounts);
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
