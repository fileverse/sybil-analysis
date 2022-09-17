const mongoose = require('mongoose');
const { Schema } = mongoose;

const _account = {};

const Donation = new Schema({
  amount: { type: String },
  token: { type: String },
  chain: { type: String },
  txn_hash: { type: String },
});

_account.schema = new Schema(
  {
    gitcoin_username: { type: String },
    is_sybil: { type: Boolean, default: false },
    main_address: { type: String, required: true, lowercase: true, index: true },
    donations: [Donation],
    connected_addresses: [{ type: String, lowercase: true }],
    active_chains: [{ type: String, enum: ["ZKSYNC", "POLYGON", "ETHEREUM"] }],

    // system generated
    createdAt: { type: Number, required: true, default: Date.now },
  },
  { usePushEach: true },
  { runSettersOnQuery: true },
);

_account.schema.pre('save', function (next) {
  const user = this;
  user.updatedAt = Date.now();
  next();
});

_account.schema.methods.safeObject = function () {
  const safeFields = [
    '_id',
    'gitcoin_username',
    'is_sybil',
    'main_address',
    'connected_addresses',
    'active_chains',
  ];
  const newSafeObject = {};
  safeFields.forEach((elem) => {
    // eslint-disable-next-line security/detect-object-injection
    newSafeObject[elem] = this[elem];
  });
  return newSafeObject;
};

_account.model = mongoose.model('accounts', _account.schema);

module.exports = _account;
