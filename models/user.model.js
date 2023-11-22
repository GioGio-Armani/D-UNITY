const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    pseudo: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 55,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      maxlength: 255,
      validate: [isEmail],
      minlength: 6,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      maxlength: 1024,
      minlength: 6,
    },
    bio: {
      type: String,
      maxlength: 1024,
    },
    picture: {
      type: String,
      default: "./uploads/profil/random-user.png",
    },
    followers: {
      type: [String],
    },
    following: {
      type: [String],
    },
    likes: {
      type: [String],
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw Error("incorrect identifiants");
  }
  throw Error("incorrect identifiants");
};

module.exports = mongoose.model("user", userSchema);
