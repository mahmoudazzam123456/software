require("dotenv").config();

const jwt = require("jsonwebtoken");

const isAuthorized = (req, res, next) => {
  if (!req.get("Authorization")) {
    let err = new Error("Authorization not found.");
    err.statusCode = 401;
    next(err);
    return;
  }
  try {
    let decodedToken = jwt.verify(
      req.get("Authorization"),
      process.env.JWT_SECRET
    );
    req.body.permission = decodedToken.role;
    req.body.userId = decodedToken.userId;
    next();
  } catch (err) {
    err.statusCode = 401;
    throw err;
  }
};

module.exports = isAuthorized;
