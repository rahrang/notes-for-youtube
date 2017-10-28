const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');

const keys = require('../config/keys.js');
const User = mongoose.model('users');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then(user => {
    done(null, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: '/auth/google/callback',
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      const existingUser = await User.findOne({ googleId: profile.id });
      if (existingUser) {
        return done(null, existingUser);
      } else {
        const user = await new User({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          photo: profile.photos[0] ? profile.photos[0].value : ''
        }).save();
        done(null, user);
      }
    }
  )
);