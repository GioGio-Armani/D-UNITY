const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    commenterId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const postSchema = new mongoose.Schema(
  {
    posterId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    picture: {
      type: String,
    },
    video: {
      type: String,
    },
    likers: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
    comments: {
      type: [commentSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("post", postSchema);
