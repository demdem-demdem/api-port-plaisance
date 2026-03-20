const mongoose = require("mongoose");

const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema(
  {
    name: { type: String, trim: true, required: [true, "Name is required"] },
    email: {
      type: String,
      trim: true,
      required: [true, "An email is required"],
      unique: true,
      lowercase: true,
    },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    throw err;
  }
});

module.exports = mongoose.model('User', userSchema);

