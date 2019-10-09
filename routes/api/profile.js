const express = require("express");
const mongoose = require('mongoose');
const passport = require('passport');
const router = express.Router();

// Load Person Model
const Person = require('../../models/Person');

// Load Profile Model
const Profile = require('../../models/Profile');

// @type GET
// @route /api/profile
// @desc route for personal user profile
// @access PRIVATE
router.get('/', passport.authenticate('jwt', { session: false }), (req, res, next) => {
  Profile
    .findOne({ user: req.user._id })
    .then(profile => {
      if (!profile) {
        return res.status(404).json({ profilenotfound: 'No Profile Found!' })
      }

      res.json(profile)
    })
    .catch(err => console.log('Got Some Error in Profile ' + err))
});

// @type POST
// @route /api/profile
// @desc route for updating/saving personal user profile
// @access PRIVATE
router.post('/', passport.authenticate("jwt", { session: false }), (req, res, next) => {
  const profileValues = {};
  profileValues.user = req.user.id;

  if (req.body.username) profileValues.username = req.body.username;
  if (req.body.website) profileValues.website = req.body.website;
  if (req.body.country) profileValues.country = req.body.country;
  if (req.body.portfolio) profileValues.portfolio = req.body.portfolio;
  if (typeof req.body.languages !== undefined) {
    profileValues.languages = req.body.languages.split(",");
  }

  // get social links
  profileValues.social = {};

  if (req.body.youtube) profileValues.social.youtube = req.body.youtube;
  if (req.body.facebook) profileValues.social.facebook = req.body.facebook;
  if (req.body.instagram) profileValues.social.instagram = req.body.instagram;

  // Do Database Stuff
  Profile.findOne({ user: req.user._id })
    .then(profile => {
      if (profile) {
        // update
        Profile.findOneAndUpdate(
          { user: req.user._id },
          { $set: profileValues },  // value that we set
          { new: true }
        )
          .then(profile => res.json(profile))
          .catch(err => console.log('Problem in update' + err))
      } else {
        // create, not req.user, but profileValues
        Profile.findOne({ username: profileValues.username })
          .then(profile => {
            if (profile) {
              // Username already exists
              res.status(400).json({ username: 'Username already exists' });
            } else {
              // save user 이부분 고치기
              new Profile(profileValues)
                .save()
                .then(profile => res.json(profile))
                .catch(err => console.log(err))
            }
          })
          .catch(err => console.log(err))
      }
    })
    .catch(err => console.log("Problem in Fetching Profile" + err))
});

// Unique username and url based access
// @type GET
// @route /api/profile/:username
// @desc route for getting user profile based on USERNAME
// @access PUBLIC
router.get('/:username', (req, res, next) => {
  Profile.findOne({ username: req.params.username })
    .populate('user', ['name', 'profilepic'])
    .then(profile => {
      if (!profile) {
        res.status(404).json({ usernotfound: 'User Not Found!' })
      }
      res.json(profile);
    })
    .catch(err => console.log('Error in Fetching Username ' + err));
});

// @type GET
// @route /api/profile/find/everyone
// @desc route for getting user profile of EVERYONE
// @access PUBLIC
router.get('/find/everyone', (req, res, next) => {
  Profile.find()
    .populate('user', ['name', 'profilepic'])
    .then(profile => {
      if (!profile) {
        res.status(404).json({ usernotfound: "No profile was found" });
      }
      res.json(profile);
    })
    .catch(err => console.log('Error in Fetching Username ' + err));
});

// @type DELETE
// @route /api/profile
// @desc route for deleting user based on ID
// @access PRIVATE
router.delete('/', passport.authenticate('jwt', { session: false }), (req, res, next) => {
  Profile.findOneAndRemove({ user: req.user._id })
    .then(() => {
      Person.findOneAndRemove({ _id: req.user._id })
        .then(() => res.json({ success: 'delete was a success' }))
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
})

// @type POST
// Pushing Array in Database
// @route /api/profile/mywork
// @desc route for adding work profile of a person
// @access PRIVATE
router.post('/workrole', passport.authenticate('jwt', { session: false }), (req, res, next) => {
  Profile.findOne({ user: req.user._id })
    .then(profile => {
      // Assignment
      const newWork = {
        role: req.body.role,
        company: req.body.company,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        details: req.body.details
      };

      profile.workrole.unshift(newWork);
      profile.save()
        .then(profile => res.json(profile))
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err))
})

// @type    DELETE
// @route    /api/profile/workrole/:w_id
// @desc    route for deleting a specific workrole
// @access  PRIVATE
router.delete('/workrole/:w_id', passport.authenticate('jwt', { session: false }), (req, res, next) => {
  Profile.findOne({ user: req.user._id })
    .then(profile => {
      // assignment to check if we got a profile
      const removethis = profile.workrole.map(item => item._id).indexOf(req.params.w_id);

      profile.workrole.splice(removethis, 1);

      profile.save()
        .then(profile => res.json(profile))
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
})

//Assignemnt - create a route to delete all elements from array and save that in database
router.delete('/workrole/deleteAll', passport.authenticate('jwt', { session: false }), (req, res, next) => {
  Profile.findOne({ user: req.user._id })
    .then(profile => {
      profile.workrole = [];
      profile.save()
        .then(profile => res.json(profile))
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
})

module.exports = router;
