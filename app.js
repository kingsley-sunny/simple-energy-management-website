const express = require("express");
const path = require("path");
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
const bodyParser = require("body-parser");
const routes = require("./routes/index");
const dashboardRoutes = require("./routes/dashboardRoutes");
const expressLayout = require("express-ejs-layouts");
const { isAdmin } = require("./middlewares/isAdmin");
const { isAuth } = require("./middlewares/isAuth");
const http = require("http");
const { Server } = require("socket.io");
const { syncDatabase, User } = require("./models");
const { adminRoutes } = require("./routes/adminRoutes");
const multer = require("multer");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads/", express.static(path.join(__dirname, "uploads")));
app.use(bodyParser.json({ limit: "50mb" }));

app.use(expressLayout);
app.set("layout", "./layout/layout");
app.set("view engine", "ejs");
// app.set("views", path.join(__dirname, "views"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  session({
    store: new SQLiteStore({
      db: "database.sqlite", // SQLite database file name
      table: "sessions", // Table name for sessions
    }),
    secret: "your-secret-key",
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24, httpOnly: true },
  })
);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Directory to save files
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Rename the file
  },
});

// app.use("/dashboard", dashboardRoutes);
app.use("/dashboard", isAuth, dashboardRoutes);
app.use("/admin", isAuth, isAdmin, adminRoutes);
app.use("/", routes);

io.on("connection", socket => {
  console.log("A user connected", socket.request.session);

  socket.on("test-timer", async data => {});
});

const PORT = 3000;

// app.listen(PORT, () => console.log(`Client server running on port ${PORT}`));
const force = false;

// Sync all models
syncDatabase(force).then(async res => {
  console.log("Database synchronized successfully");
  // await User({ type: "admin" }, { where: { id: 1 } }).then(res => console.log(res));

  server.listen(PORT, () => console.log(`Client server running on port ${PORT}`));
});
