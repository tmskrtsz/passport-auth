const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");

// Model
const User = require("../models/User");
// Login
router.get("/login", (req, res) => res.render("login"));

// Register
router.get("/register", (req, res) => res.render("register"));

// Register handle
router.post("/register", (req, res) => {
	const { name, email, password, password2 } = req.body;
	let errors = [];

	// Check required fields
	if (!name || !email || !password || !password2) {
		errors.push({ msg: "Please fill in all fields" });
	}

	// Check if passwords match
	if (password !== password2) {
		errors.push({ msg: "Passswords don't match!" });
	}

	// Check pass length
	if (password.length < 2) {
		errors.push({ msg: "Please should be at least 6 characters" });
	}

	if (errors.length > 0) {
		res.render("register", {
			errors,
			name,
			email,
			password,
			password2,
		});
	} else {
		// Validation passes
		User.findOne({ email: email }).then(user => {
			if (user) {
				// User exists
				errors.push({ msg: "Email already exists!" });
				res.render("register", {
					errors,
					name,
					email,
					password,
					password2,
				});
			} else {
				const newUser = new User({
					name,
					email,
					password,
				});
				// Enrypt password
				bcrypt.genSalt(10, (err, salt) =>
					bcrypt.hash(newUser.password, salt, (err, hash) => {
						if (err) throw err;
						newUser.password = hash;
						// Save user
						newUser
							.save()
							.then(user => {
								req.flash(
									"success_msg",
									"You are now registered and can log in"
								);
								res.redirect("/users/login");
							})
							.catch(err => console.log(err));
					})
				);
			}
		});
	}
});

// Login handler
router.post("/login", (req, res, next) => {
	passport.authenticate("local", {
		successRedirect: "/dashboard",
		failureRedirect: "/users/login",
		failureFlash: true,
	})(req, res, next);
});

// Logout handler
router.get("/logout", (req, res) => {
	req.logout();
	req.flash("success_msg", "You are logged out");
	res.redirect("/users/login");
});

module.exports = router;
