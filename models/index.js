const _models = {};

_models.Account = require('./account').model;
_models.Txn = require('./txn').model;

module.exports = _models;
