const mongoose = require('mongoose');
const { Schema } = mongoose;

const _txns = {};

_txns.schema = new Schema(
  {
    from: { type: String, lowercase: true },
    to: { type: String, lowercase: true },
    txn_hash: { type: String, lowercase: true, index: true },
    chain: { type: String, enum: ["ZKSYNC", "POLYGON", "ETHEREUM"] },
    token: { type: String },
    amount: { type: String },
    zksync_account_id: { type: String },
    commited_at: { type: String },
    executed_at: { type: String },
    executed_at_timestamp: { type: Number },
    raw_data: { type: Schema.Types.Mixed },
  },
  { usePushEach: true },
  { runSettersOnQuery: true },
);

_txns.schema.pre('save', function (next) {
  const user = this;
  user.updatedAt = Date.now();
  next();
});

_txns.schema.methods.safeObject = function () {
  const safeFields = [
    '_id',
    'from',
    'grant_address',
    'txn_hash',
    'chain',
    'executed_at',
  ];
  const newSafeObject = {};
  safeFields.forEach((elem) => {
    // eslint-disable-next-line security/detect-object-injection
    newSafeObject[elem] = this[elem];
  });
  return newSafeObject;
};

_txns.model = mongoose.model('txns', _txns.schema);

module.exports = _txns;
