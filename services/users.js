const User = require("../models/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Get a user by its Id
exports.getById = async (id) => {
  const user = await User.findOne({ _id: id });
  if (!user) {
    throw new Error("user_not_found");
  }
  return user;
};

// We create/add a new use, we also search all the others users if they use the same email, if so it's not created!
exports.add = async (userData) => {
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new Error("email_already_exists");
  }
  return await User.create(userData);
};

// We modify/update the user
exports.modify = async (id, userData) => {
  const user = await User.findById(id);

  // If the id isnt recognized, we throw an error
  if (!user) {
    throw new Error("user_not_found");
  }

// If there is an email, and if the email isnt the same AND is not used by someone else
  if (userData.email && userData.email !== user.email) {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error("email_already_exists");
    }
    user.email = userData.email;
  }

  // If the name is given, we change it anyway
  if (userData.name) user.name = userData.name;

  // If the password is given, we change it
  if (userData.password && userData.password.trim() !== "") {
    user.password = userData.password;
  }

  return await user.save();
};

// Delete a user (they got fired)
exports.delete = async (id) => {
  return await User.deleteOne({ _id: id });
};

// Handles the authentification process, and the result is written in a cookie in index.js
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
