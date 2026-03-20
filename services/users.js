const User = require("../models/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.add = async (req, res, next) => {
  const temp = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  };
  try {
    let user = await User.create(temp);

    return res.status(201).json(user);
  } catch (err) {
    console.error("db errore:", err);
    return res.status(501).json(err);
  }
};

exports.delete = async (req, res, next) => {
  const id = req.params.id;

  try {
    await User.deleteOne({ _id: id });

    return res.status(204).json("delete_ok");
  } catch (err) {
    return res.status(501).json(err);
  }
};

exports.authenticate = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne(
      { email: email },
      "-__v -createdAt -updatedAt",
    );

    if (user) {
      bcrypt.compare(password, user.password, function (err, response) {
        if (err) {
          throw new Error(err);
        }
        if (response) {
          delete user._doc.password;

          const expireIn = 24 * 60 * 60;
          const token = jwt.sign(
            {
              user: user,
            },
            process.env.SECRET_KEY,
            {
              expiresIn: expireIn,
            },
          );

          res.header("Authorization", "Bearer " + token);

          return res.render("addUser", {
            title: "Home",
          });
        }

        return res.status(403).json("wrong_credentials");
      });
    } else {
      return res.status(404).json("user_not_found");
    }
  } catch (err) {
    return res.status(501).json(err);
  }
};
