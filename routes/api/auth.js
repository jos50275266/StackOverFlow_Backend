const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const key = require("../../setup/myurl");
const router = express.Router();

// @type GET
// @route /api/auth
// @desc just for testing
// @access PUBLIC

router.get("/", (req, res, next) => {
  res.json({ test: "Auth is success" });
});

// Import Schema for Person to Register
const Person = require("../../models/Person");

// @type POST
// @route /api/auth/register
// @desc route for registration of users
// @access PUBLIC

router.post("/register", (req, res) => {
  Person.findOne({ email: req.body.email })
    .then(person => {
      if (person) {
        return res
          .status(400)
          .json({ emailerror: "Email is already registered in our system" });
      } else {
        const newPerson = new Person({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password
        });
        //Encrypt password using bcrypt
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newPerson.password, salt, (err, hash) => {
            if (err) throw err;
            newPerson.password = hash;
            newPerson
              .save()
              .then(person => res.json(person))
              .catch(err => console.log(err));
          });
        });
      }
    })
    .catch(err => console.log(err));
});

// @type POST
// @route /api/auth/login
// @desc route for login  of users
// @access PUBLIC

router.post("/login", (req, res, next) => {
  // from form-tag
  const email = req.body.email;
  const password = req.body.password;

  Person.findOne({ email })
    .then(person => {
      if (!person) {
        return res.status(404).json({ emailError: 'User not found with this email' })
      }
      bcrypt
        .compare(password, person.password)
        .then(isCorrect => {
          // true or false
          if (isCorrect) {
            // res.json({ success: 'User is able to login with successfully' });
            // use payload and create token for user
            const payload = {
              id: person.id,
              name: person.name,
              email: person.email
            };

            jwt.sign(payload, key.secretOrKey, { expiresIn: 3600 }, (err, token) => {
              res.json({
                success: true,
                // token: token이 헷갈려서 명확히 명시해줄려고
                token: "Bearer " + token
              })
            });
          } else {
            res.status(400).json({ passworderror: 'Password is not correct' });
          }
        })
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
});

// @type GET
// @route /api/auth/profile
// @desc route for user profle
// @access PRIVATE

router.get('/profile', passport.authenticate('jwt', { session: false }), (req, res, next) => {
  // console.log(req.user);
  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    profilepic: req.user.profilepic
  })
});



module.exports = router;
