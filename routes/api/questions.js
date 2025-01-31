const passport = require('passport');
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

// Load Person Model
const Person = require("../../models/Person");
// Load Profile Model
const Profile = require("../../models/Profile");
// Load Question Model
const Question = require("../../models/Question");

// @type GET
// @route /api/questions
// @desc route for showing all questions!
// @access PUBLIC

router.get("/", (req, res, next) => {
  Question
    .find({})
    .sort({ date: 'DESC' })
    .then(questions => res.json(questions))
    .catch(err => res.json({ noquestion: 'No question to display' }))
});

// @type POST
// @route /api/questions
// @desc route for submitting questions
// @access PRIVATE
router.post("/", passport.authenticate('jwt', { session: false }), (req, res, next) => {

  const newQuestion = new Question({
    textone: req.body.textone,
    texttwo: req.body.texttwo,
    user: req.user._id,
    name: req.body.name
  });

  newQuestion
    .save()
    .then(question => res.json(question))
    .catch(err => console.log(`Unable to push question to database: ${err}`));
}
);

// @type  POST
// @route /api/answers/:id
// @desc  route for submitting answers to questions
// @access PRIVATE
router.post("/answers/:id", passport.authenticate("jwt", { session: false }), (req, res, next) => {
  Question.findById(req.params.id)
    .then(question => {
      console.log(question);
      const newAnswer = {
        user: req.user.id,
        name: req.body.name,
        text: req.body.text
      };

      question.answers.unshift(newAnswer);

      question
        .save()
        .then(question => res.json(question))
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
}
);

// @type  POST
// @route /api/questions/upvote/:question_id
// @desc  route for upvoting
// @access PRIVATE
router.post('/upvote/:question_id', passport.authenticate('jwt', { session: false }), (req, res, next) => {
  Profile.findOne({ user: req.user._id })
    .then(profile => {
      Question.findById(req.params.question_id)
        .then(question => {
          if (question.upvotes.filter(upvote => upvote.user.toString() === req.user._id.toString()).length > 0) {
            // return res.status(400).json({ noupvote: 'User already upvoted' })
            // 대신에 좋아요 취소로 만들기
            const downvote = question.upvotes.find(vote => vote.user.toString() === req.user._id.toString())
            const downvoteIndex = question.upvotes.indexOf(downvote);
            console.log(question.upvotes)
            question.upvotes.splice(downvoteIndex, 1);
            question
              .save()
              .then(question => res.json(question))
              .catch(err => console.log(err))
          } else {
            question.upvotes.unshift({ user: req.user._id });
            question
              .save()
              .then(question => res.json(question))
              .catch(err => console.log(err))
          }
        })
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
})

// Assignment - remove upvoting
// Delete Questions
router.delete('/upvote/deleteAll', passport.authenticate('jwt', { session: false }), (req, res, next) => {
  Question.deleteMany({})
    .then(deleteResults => res.json(deleteResults))
    .catch(err => console.log(err))
})
// Delete all question

// Create a separate route for linux question
// 1. Description
// 2. Code
// 3. Error


module.exports = router;
