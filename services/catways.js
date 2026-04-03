const Catway = require("../models/catways");

/**
 * Créer un nouveau catway dans la base de données.
 * 
 * @async
 * @function createCatway
 * @param {Object} catwayData - Les données du catway à créer.
 * @param {number} catwayData.catwayNumber - Numéro unique du catway.
 * @param {string} catwayData.type - Type de catway ('long' ou 'short').
 * @param {string} catwayData.catwayState - État actuel du catway.
 * @returns {Promise<Object>} Le document Catway créé.
 * @throws {Error} Si le catway existe déjà.
 */
exports.createCatway = async (catwayData) => {
  const data = await Catway.findOne({ catwayNumber: catwayData.catwayNumber });
  if (data) {
    throw new Error("Le catway existe déjà");
  };
  return await Catway.create(catwayData);
};

/**
 * Récupère tous les catways.
 * 
 * @async
 * @function getAllCatways
 * @returns {Promise<Array<Object>>} Liste de tous les catways.
 */
exports.getAllCatways = async () => {
  return await Catway.find();
};

/**
 * Récupère un catway spécifique par son ID technique.
 * 
 * @async
 * @function getCatwayById
 * @param {string} id - L'identifiant unique MongoDB du catway.
 * @returns {Promise<Object>} Le document Catway trouvé.
 * @throws {Error} Si le catway n'est pas trouvé.
 */
exports.getCatwayById = async (id) => {
  const catway = await Catway.findOne({ _id: id });
  if (!catway) {
    throw new Error("Catway non trouvé");
  }
  return catway;
};

/**
 * Met à jour les informations d'un catway.
 * 
 * @async
 * @function updateCatway
 * @param {string} id - L'identifiant unique du catway à modifier.
 * @param {Object} catwayData - Les nouvelles données à appliquer.
 * @returns {Promise<Object>} Le document Catway mis à jour.
 * @throws {Error} Si le catway n'est pas trouvé.
 */
exports.updateCatway = async (id, catwayData) => {
  const catway = await Catway.findByIdAndUpdate(id, catwayData, {
    new: true, 
    runValidators: true,
    overwrite: false
  });
  if (!catway) {
    throw new Error("Catway non trouvé");
  }
  return catway;
};

/**
 * Supprime un catway de la base de données.
 * 
 * @async
 * @function deleteCatway
 * @param {string} id - L'identifiant unique du catway à supprimer.
 * @returns {Promise<{message: string}>} Message de confirmation.
 * @throws {Error} Si le catway n'est pas trouvé.
 */
exports.deleteCatway = async (id) => {
  const result = await Catway.deleteOne({ _id: id });
  if (result.deletedCount === 0) {
    throw new Error("Catway non trouvé");
  }
  return { message: "Catway deleted successfully" };
};