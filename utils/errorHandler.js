// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  return res
    .status(err.code || 500)
    .json({ message: err.message, token: err.token });
}

module.exports = errorHandler;
