const User = require("../models/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/**
 * Récupère un utilisateur par son identifiant.
 *
 * @async
 * @function getById
 * @param {string} id - L'ID technique de l'utilisateur.
 * @returns {Promise<Object>} L'utilisateur trouvé.
 * @throws {Error} Si l'utilisateur n'existe pas.
 */
exports.getById = async (id) => {
  const user = await User.findOne({ _id: id });
  if (!user) {
    throw new Error("utilisateur_non_trouve");
  }
  return user;
};

/**
 * Ajoute un nouvel utilisateur dans le système.
 * Vérifie que l'email n'est pas déjà utilisé.
 *
 * @async
 * @function add
 * @param {Object} userData - Les informations de l'utilisateur (name, email, password).
 * @returns {Promise<Object>} L'utilisateur créé.
 * @throws {Error} Si l'email est déjà utilisé.
 */
exports.add = async (userData) => {
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new Error("email_deja_existant");
  }
  // Hash the password before creating the user
  userData.password = await bcrypt.hash(userData.password, 10);
  return await User.create(userData); // The password is now hashed
};

/**
 * Modifie les informations d'un utilisateur existant.
 *
 * @async
 * @function modify
 * @param {string} id - L'ID de l'utilisateur à modifier.
 * @param {Object} userData - Les données à mettre à jour (name, email, password, ancien mot de passe).
 * @returns {Promise<Object>} L'utilisateur mis à jour.
 * @throws {Error} Si l'utilisateur n'est pas trouvé ou si le nouvel email existe déjà.
 * @throws {Error} Si l'ancien mot de passe n'est pas fourni lors d'un changement de mot de passe.
 * @throws {Error} Si l'ancien mot de passe fourni est incorrect.
 */
exports.modify = async (id, userData) => {
  const user = await User.findById(id);

  // If the id isnt recognized, we throw an error
  if (!user) {
    throw new Error("utilisateur_non_trouve");
  }

  // If there is an email, and if the email isnt the same AND is not used by someone else
  if (userData.email && userData.email !== user.email) {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error("email_deja_existant");
    }
    user.email = userData.email;
  }

  // If the name is given, we change it anyway
  if (userData.name) user.name = userData.name;

  // If a new password is given, we need to validate the old password and hash the new one, charal style
  if (userData.password && userData.password.trim() !== "") {
    // Check if old password is provided when a new password is being set
    if (!userData['old-password'] || userData['old-password'].trim() === "") {
      throw new Error("ancien_mot_de_passe_requis");
    }

    // Compare the old password with the current hashed password
    const isMatch = await bcrypt.compare(userData['old-password'], user.password);
    if (!isMatch) {
      throw new Error("ancien_mot_de_passe_incorrect");
    }
    // Hash the new password before saving, safety first :)
    user.password = await bcrypt.hash(userData.password, 10);
  }

  return await user.save();
};

/**
 * Supprime un utilisateur.
 *
 * @async
 * @function delete
 * @param {string} id - L'ID de l'utilisateur à supprimer.
 * @returns {Promise<Object>} Résultat de l'opération de suppression.
 */
exports.delete = async (id) => {
  return await User.deleteOne({ _id: id });
};

/**
 * Gère le processus d'authentification d'un utilisateur.
 * Vérifie les identifiants et génère un token JWT.
 *
 * @async
 * @function authenticate
 * @param {string} email - L'email de l'utilisateur.
 * @param {string} password - Le mot de passe en clair.
 * @returns {Promise<{user: Object, token: string}>} L'utilisateur (sans mot de passe) et le token de session.
 * @throws {Error} Si l'utilisateur est introuvable ou si le mot de passe est incorrect.
 */
exports.authenticate = async (email, password) => {
  let user = await User.findOne({ email: email }, "-__v -createdAt -updatedAt");

  if (!user) {
    throw new Error("utilisateur_non_trouve");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("identifiants_incorrects");
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
