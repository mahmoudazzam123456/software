const { validationResult } = require("express-validator");

const validateRequest = (req, res, next) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error(errors.array()[0].msg);
    err.statusCode =
      err.message === "You dont have permission to do this." ? 403 : 400;
    throw err;
  }
  next();
};
module.exports = validateRequest;
