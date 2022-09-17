const _models = {};

_models.Account = require('./account').model;
_models.Donation = require('./donation').model;

module.exports = _models;
