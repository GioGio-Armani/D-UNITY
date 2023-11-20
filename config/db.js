const mongoose = require("mongoose");
mongoose
  .connect("mongodb://127.0.0.1:27017/D-UNITY")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Failed to connect to MongoDB", err));
