const mongoose = require('mongoose');
const { Schema } = mongoose;

const _donation = {};

_donation.schema = new Schema(
  {
    from: { type: String, lowercase: true },
    grant_address: { type: String, lowercase: true },
    txn_hash: { type: String, lowercase: true },
    chain: { type: String, enum: ["ZKSYNC", "POLYGON", "ETHEREUM"] },
    executed_on: { type: Number, required: true },
  },
  { usePushEach: true },
  { runSettersOnQuery: true },
);

_donation.schema.pre('save', function (next) {
  const user = this;
  user.updatedAt = Date.now();
  next();
});

_donation.schema.methods.safeObject = function () {
  const safeFields = [
    '_id',
    'from',
    'grant_address',
    'txn_hash',
    'chain',
    'executed_on',
  ];
  const newSafeObject = {};
  safeFields.forEach((elem) => {
    // eslint-disable-next-line security/detect-object-injection
    newSafeObject[elem] = this[elem];
  });
  return newSafeObject;
};

_donation.model = mongoose.model('donations', _donation.schema);

module.exports = _donation;
