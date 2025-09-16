const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");
const User = require("./models/User");
const cors = require("cors");   // ✅ import cors


const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

//module.exports = mongoose.model("User", UserSchema);




const Waste = require("./models/waste");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "mysecretkey",
    resave: false,
    saveUninitialized: true
  })
);


// ✅ Set EJS as view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


//app.use(express.static(path.join(__dirname, "public")));


// Connect to MongoDB
//mongoose.connect("mongodb://127.0.0.1:27017/wasteDB", {
mongoose.connect("mongodb+srv://joshidurvesh667_db_user:1ol7oFKi9C2NdMZp@cluster0.k6invwg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log(err));


app.get("/login", (req, res) => {
	if (req.session.user) {
	//res.send(`<h1>Welcome ${req.session.user.username}</h1>              <a href="/logout">Logout</a>`);
		res.redirect("/dashboard");
	}
  res.sendFile(path.join(__dirname, "public", "login.html"));
});  
  



app.get("/register", (req, res) => {
	if (req.session.user) {
	//res.send(`<h1>Welcome ${req.session.user.username}</h1>              <a href="/logout">Logout</a>`);
		res.redirect("/dashboard");
	}
  res.sendFile(path.join(__dirname, "public", "register.html"));
});

// Registration
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.redirect("/");
  } catch (err) {
    res.send("User already exists or error occurred.");
  }
});

app.get("/dashboard", (req, res) => {
  if (req.session.user) {
    res.render("dashboard", { user: req.session.user });  // ✅ pass user object
  } else {
    res.redirect("/login");
  }
});


// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
	console.log(user, "user")
  if (user && (await bcrypt.compare(password, user.password))) {
    req.session.user = user;
	console.log("login success", user)
          res.redirect("/dashboard");

  } else {
    res.send("Invalid login credentials");
  }
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

// Add waste entry
app.post("/api/waste", async (req, res) => {
  try {
    const { userId, type, details } = req.body;
    const newEntry = new Waste({ userId, type, details });
    await newEntry.save();
    res.json({ success: true, data: newEntry });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// Fetch all waste entries
app.get("/api/waste", async (req, res) => {
  const entries = await Waste.find().sort({ createdAt: -1 }).limit(20);
  res.json(entries);
});


// Routes
app.get("/", (req, res) => {
	console.log("after login");
	console.log(req.session, "req.session.user")
  if (req.session.user) {
    //res.send(`<h1>Welcome ${req.session.user.username}</h1>              <a href="/logout">Logout</a>`);
	res.sendFile(path.join(__dirname, "public", "dashboard.html"));
  } else {
    //res.sendFile(path.join(__dirname, "public", "login.html"));
	res.redirect("/login");
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
