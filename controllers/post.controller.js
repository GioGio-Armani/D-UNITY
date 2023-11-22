const postModel = require("../models/post.model");
const userModel = require("../models/user.model");
const ObjectID = require("mongoose").Types.ObjectId;
const fs = require("fs");
const { promisify } = require("util");
const pipeline = promisify(require("stream").pipeline);
const { Readable } = require("stream");
const { uploadErrors } = require("../utils/errors.utils");

module.exports = {
  // get all posts --------------
  readPost: async (req, res) => {
    try {
      const post = await postModel.find({}).sort({ createdAt: -1 });
      res.status(200).json(post);
    } catch (err) {
      res.status(500).json(err);
    }
  },
  // create a post -----------------
  createPost: async (req, res) => {
    let fileName;
    if (req.file !== undefined) {
      try {
        if (
          req.file.mimetype != "image/jpg" &&
          req.file.mimetype != "image/png" &&
          req.file.mimetype != "image/jpeg"
        ) {
          throw Error("invalid file");
        }

        if (req.file.size > 500000) throw Error("max size");
      } catch (err) {
        const errors = uploadErrors(err);
        return res.status(200).json({ errors });
      }

      fileName = req.body.posterId + Date.now() + ".jpg";

      const uploadPath = __dirname + "/../client/public/uploads/post/";
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      const readableStream = new Readable({
        read() {
          this.push(req.file.buffer);
          this.push(null);
        },
      });

      await pipeline(
        readableStream,
        fs.createWriteStream(uploadPath + fileName)
      )
        .then(() => {
          console.log("image uploaded");
        })
        .catch((err) => {
          console.log(err);
        });
    }

    const newPost = new postModel({
      posterId: req.body.posterId,
      message: req.body.message,
      picture: req.file !== undefined ? "./uploads/post/" + fileName : "",
      video: req.body.video,
    });

    try {
      const post = await newPost.save();
      res.status(201).json(post);
    } catch (err) {
      res.status(400).json("Error creating new data :" + err);
    }
  },

  // update a post ---------------------
  updatePost: async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
      return res.status(400).send("ID unknown : " + req.params.id);

    const updatedRecord = {
      message: req.body.message,
    };

    try {
      const updatedPost = await postModel.findByIdAndUpdate(
        req.params.id,
        { $set: updatedRecord },
        { new: true }
      );
      if (!updatedPost) {
        return res.status(400).send("invalid ID :" + req.params.id);
      }
      res.status(200).json({ message: "Successfully updated. " });
    } catch (err) {
      res.status(400).json("Error updating data :" + err);
    }
  },

  // delete a post ----------------------
  deletePost: async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
      return res.status(400).send("ID unknown : " + req.params.id);
    try {
      const deletePost = await postModel
        .deleteOne({ _id: req.params.id })
        .exec();
      if (deletePost.deletedCount === 0) {
        return res.status(400).send("invalid ID :" + req.params.id);
      }
      res.status(200).json({ message: "Successfully deleted. " });
    } catch (err) {
      res.status(400).json("Error deleting data :" + err);
    }
  },

  // like a post ----------------------
  likePost: async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
      return res.status(400).send("ID post unknown : " + req.params.id);
    if (!ObjectID.isValid(req.body.id))
      return res.status(400).send("ID user unknown : " + req.body.id);

    try {
      await postModel.findByIdAndUpdate(
        req.params.id,
        { $addToSet: { likers: req.body.id } },
        { new: true, upsert: true }
      );
      await userModel.findByIdAndUpdate(
        req.body.id,
        { $addToSet: { likes: req.params.id } },
        { new: true, upsert: true }
      );
      return res.status(201).json({ message: "Like ajouté" });
    } catch (err) {
      console.log(err);
      return res.status(400).json({ message: "like impossible" });
    }
  },

  // unlike a post ----------------------
  unlikePost: async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
      return res.status(400).send("ID post unknown : " + req.params.id);
    if (!ObjectID.isValid(req.body.id))
      return res.status(400).send("ID user unknown : " + req.body.id);

    try {
      await postModel.findByIdAndUpdate(
        req.params.id,
        { $pull: { likers: req.body.id } },
        { new: true, upsert: true }
      );
      await userModel.findByIdAndUpdate(
        req.body.id,
        { $pull: { likes: req.params.id } },
        { new: true, upsert: true }
      );
      return res.status(201).json({ message: "Like retiré" });
    } catch (err) {
      console.log(err);
      return res.status(400).json({ message: "unlike impossible" });
    }
  },

  // comment a post ----------------------

  commentPost: async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
      return res.status(400).send("ID post unknown : " + req.params.id);
    if (!ObjectID.isValid(req.body.commenterId))
      return res.status(400).send("ID user unknown : " + req.body.commenterId);

    try {
      const commented = await postModel.findByIdAndUpdate(
        req.params.id,
        {
          $push: {
            comments: {
              commenterId: req.body.commenterId,
              text: req.body.text,
            },
          },
        },
        { new: true }
      );
      if (!commented) {
        return res.status(400).json({ message: "Error comment" });
      }
      res.status(200).json({ message: "Successfully commented. " });
    } catch (err) {
      console.log(err);
      return res.status(400).json({ message: "Error comment" });
    }
  },

  // edit a comment ----------------------

  editCommentPost: async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
      return res.status(404).send("ID post unknown : " + req.params.id);

    try {
      const postFinded = await postModel.findById(req.params.id);
      if (!postFinded) {
        return res.status(404).json({ message: "Unknown post" });
      }
      const comment = postFinded.comments.find((comment) =>
        comment._id.equals(req.body.commentId)
      );
      if (!comment) {
        return res.status(404).json({ message: "Unknown comment" });
      }
      if (!req.body.text) {
        return res.status(404).json({ message: "No text" });
      }
      comment.text = req.body.text;
      return postFinded
        .save()
        .then(() => {
          res.status(200).json({ message: "Successfully edited. " });
        })
        .catch((error) => {
          console.log(error);
          res.status(500).json({ message: "Error editing" });
        });
    } catch (err) {
      console.log(err);
      return res.status(403).json({ message: "Error editing" });
    }
  },

  // delete a comment ----------------------

  deleteCommentPost: async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
      return res.status(404).send("ID post unknown : " + req.params.id);

    try {
      return postModel
        .findByIdAndUpdate(
          req.params.id,
          {
            $pull: {
              comments: {
                _id: req.body.commentId,
              },
            },
          },
          { new: true }
        )
        .then(() => {
          res.status(200).json({ message: "Successfully deleted." });
        })
        .catch((error) => {
          console.log(error);
          res.status(500).json({ message: "Error deleting" });
        });
    } catch (err) {
      console.log(err);
      return res.status(403).json({ message: "Error deleting" });
    }
  },
};
