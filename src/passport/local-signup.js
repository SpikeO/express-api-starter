const { Strategy: PassportLocalStrategy } = require('passport-local');
const { models } = require('../db/index');

/**
 * Return the Passport Local Strategy object.
 */
module.exports = new PassportLocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  session: false,
  passReqToCallback: true
}, async (req, email, password, done) => {
  const userData = {
    email: email.trim(),
    password: password.trim(),
    name: req.body.name.trim()
  };

  const newUser = await models.user.create(userData);
  newUser.save((err) => {
    if (err) { return done(err); }

    return done(null);
  });
});