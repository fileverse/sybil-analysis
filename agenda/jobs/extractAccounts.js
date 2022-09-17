const Axios = require('axios');
const { Donation } = require('../../models');
const agenda = require('../index');
const jobTypes = require('../jobType');

agenda.define(jobTypes.EXTRACT_ACCOUNTS, async (job, done) => {
  try {
    await run();
    done();
  } catch (err) {
    console.error(
      'Error removing job from collection',
      jobTypes.EXTRACT_ACCOUNTS,
    );
    done(err);
  }
});

async function run() {
    const query = [
        {
            $match: {},
        },
        {
            $group: {
                _id: '$from',
                active_chains: {
                    $push: '$chain',
                },
            },
        }
    ];
    const acounts = await Donation.aggregate(query);
    console.log(acounts);
    console.log('Success!');
}
