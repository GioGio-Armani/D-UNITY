const router = require("express").Router();
const authController = require("../controllers/auth.controller");
const userController = require("../controllers/user.controller");
const uploadController = require("../controllers/upload.controller");
const multer = require("multer");
const upload = multer();

//auth
router
  .post("/register", authController.signUp)
  .post("/login", authController.signIn)
  .get("/logout", authController.logout);

//user DB

router
  .get("/", userController.getAllUsers)
  .get("/:id", userController.userInfo)
  .put("/:id", userController.updateUser)
  .delete("/:id", userController.deleteUser)
  .patch("/follow/:id", userController.follow)
  .patch("/unfollow/:id", userController.unfollow);

// upload

router.post("/upload", upload.single("file"), uploadController.uploadProfil);

module.exports = router;
