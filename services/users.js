const User = require("../models/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.add = async (userData) => {
  // The service only receives the data it needs
  return await User.create(userData);
};

exports.delete = async (id) => {
  return await User.deleteOne({ _id: id });
};

exports.authenticate = async (email, password) => {
  let user = await User.findOne(
    { email: email },
    "-__v -createdAt -updatedAt",
  );

  if (!user) {
    throw new Error("user_not_found");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  
  if (!isMatch) {
    throw new Error("wrong_credentials");
  }

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

  return { user, token };
};
