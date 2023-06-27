const express = require("express");
const path = require("path");
const app = express();

const defaultRoutes = require("./routes/default");
const videosRoutes = require("./routes/video");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use("/", defaultRoutes);
app.use("/", videosRoutes);

app.use(function (req, res) {
  res.status(404).render("404");
});

app.use(function (error, req, res, next) {
  res.status(500).render("500");
});

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
