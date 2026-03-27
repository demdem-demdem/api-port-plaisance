const Catway = require("../models/catways");

exports.createCatway = async (catwayData) => {

  return await Catway.create(catwayData);
};

exports.getAllCatways = async () => {
  return await Catway.find();
};

exports.getCatwayById = async (id) => {
  const catway = await Catway.findById(id);
  if (!catway) {
    throw new Error("Catway not found");
  }
  return catway;
};

exports.updateCatway = async (id, catwayData) => {
  const catway = await Catway.findByIdAndUpdate(id, catwayData, {
    new: true, 
    runValidators: true,
    overwrite: false // PATCH/Partial by default, PUT passes the full object anyway
  });
  if (!catway) {
    throw new Error("Catway not found");
  }
  return catway;
};

exports.deleteCatway = async (id) => {
  const result = await Catway.deleteOne({ _id: id });
  if (result.deletedCount === 0) {
    throw new Error("Catway not found");
  }
  return { message: "Catway deleted successfully" };
};