require("dotenv").config();

const User = require("../models/user");

/*const bcrypt = require("bcrypt");*/
const jwt = require("jsonwebtoken");

exports.login = (req, res, next) => {
  const { email, password } = req.body;
  let loadedUser;
  User.findOne({ where: { email: email } })
    .then((user) => {
      if (!user) {
        const err = new Error("Email is not found.");
        err.statusCode = 400;
        throw err;
      }
      loadedUser = user;
      return compare(password, user.password);
    })
    .then((isSame) => {
      if (!isSame) {
        const err = new Error("Password is wrong.");
        err.statusCode = 400;
        throw err;
      }
      const token = jwt.sign(
        { userId: loadedUser.id, role: loadedUser.role },
        process.env.JWT_SECRET,
        {
          expiresIn: "2h",
        }
      );
      res
        .status(200)
        .json({ message: "Login successfully.", Authorization: token });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
