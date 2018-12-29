const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const app = express();
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const flash = require("connect-flash");

// Require dotenv in development
if (process.env.NODE_ENV !== "production") require("dotenv").load();

// Mongoose Database
const db = require("./config/keys").MongoURI;
mongoose
	.connect(
		db,
		{ useNewUrlParser: true }
	)
	.then(() => console.log("MongoDB Connected"))
	.catch(err => console.log(err));

// Passport init
require("./config/passport")(passport);

// Middleware
app.use(expressLayouts);
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(
	session({
		secret: "secret",
		resave: true,
		saveUninitialized: true,
	})
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Global vars
app.use((req, res, next) => {
	res.locals.success_msg = req.flash("success_msg");
	res.locals.error_msg = req.flash("error_msg");
	res.locals.error = req.flash("error");
	next();
});

// Routes
app.use("/", require("./routes/index"));
app.use("/users", require("./routes/users"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server started on port: ${PORT}`));
