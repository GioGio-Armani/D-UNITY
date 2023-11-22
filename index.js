const express = require("express");
const dotenv = require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const helmet = require("helmet");
const lusca = require("lusca");
const session = require("express-session");

const userRoutes = require("./routes/user.routes");
const postRoutes = require("./routes/post.routes");
const { checkUser, requireAuth } = require("./middleware/auth.middleware");
require("./config/db");

const app = express();
const port = process.env.PORT;

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true, // Permet l'envoi de cookies et d'authentification dans les requêtes cross-origin
};

// middleware

app.use(
  session({
    secret: process.env.TOKEN_SECRET, // Choisissez un secret de session fort
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Mettez 'secure' à 'true' si vous êtes en HTTPS
  })
);
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(lusca.csrf({ cookie: true }));

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, "client/build")));

// jwt
app.get("*", checkUser);
app.get("/jwtid", requireAuth, (req, res) => {
  res.status(201).send(res.locals.user._id);
});

// csrf
app.get("/csrf-token", (req, res) => {
  res.status(201).send({ csrfToken: req.csrfToken() });
});

//routes
app.use("/api/user", userRoutes);
app.use("/api/post", postRoutes);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build", "index.html"));
});

//server
app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`);
});
