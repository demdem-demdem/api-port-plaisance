const Catway = require("../models/catways");

// Create a catway
exports.createCatway = async (catwayData) => {
  return await Catway.create(catwayData);
};

// Get all the catways
exports.getAllCatways = async () => {
  return await Catway.find();
};

// Get a specific catway by ID
exports.getCatwayById = async (id) => {
  const catway = await Catway.findOne({ _id: id });
  if (!catway) {
    throw new Error("Catway not found");
  }
  return catway;
};

// Update the catway with the new infos
exports.updateCatway = async (id, catwayData) => {
  const catway = await Catway.findByIdAndUpdate(id, catwayData, {
    new: true, 
    runValidators: true,
    overwrite: false
  });
  if (!catway) {
    throw new Error("Catway not found");
  }
  return catway;
};

// Delete a catway!!
exports.deleteCatway = async (id) => {
  const result = await Catway.deleteOne({ _id: id });
  if (result.deletedCount === 0) {
    throw new Error("Catway not found");
  }
  return { message: "Catway deleted successfully" };
};