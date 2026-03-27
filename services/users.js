const User = require("../models/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.getById = async (id) => {
  const user = await User.findOne({ _id: id });
  if (!user) {
    throw new Error("user_not_found");
  }
  return user;
};


exports.add = async (userData) => {
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new Error("email_already_exists");
  }

  return await User.create(userData);
};

exports.modify = async (id, userData) => {
  const user = await User.findById(id);

  if (!user) {
    throw new Error("user_not_found");
  }

  if (userData.email && userData.email !== user.email) {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error("email_already_exists");
    }
    user.email = userData.email;
  }

  if (userData.name) user.name = userData.name;

  if (userData.password && userData.password.trim() !== "") {
    user.password = userData.password;
  }

  return await user.save();
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
