const express = require("express");
const session = require("express-session");
const passport = require("passport");
const strategy = require(`${__dirname}/strategy`);
const { clientID } = require(`${__dirname}/config.js`);
const request = require("request");

const app = express();
app.use(
  session({
    secret: "password",
    resave: false,
    saveUninitialized: false
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(strategy);

passport.serializeUser((user, done) => {
  const { _json } = user;
  done(null, {
    clientID: _json.clientID,
    email: _json.email,
    name: _json.name,
    nickname: _json.nickname,
    followers_url: _json.followers_url
  });
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

app.get(
  "/login",
  passport.authenticate("auth0", {
    successRedirect: "/followers",
    failureRedirect: "/login",
    failureFlash: true,
    connection: "github"
  })
);

app.get("/followers", function(req, res, next) {
  if (!req.user) {
    return res.redirect("/login");
  } else {
    const FollowersRequest = {
      url: `https://api.github.com/users/${req.user.nickname}/followers`,
      headers: {
        "User-Agent": clientID
      }
    };
    request(FollowersRequest, (error, response, body) => {
      return res.send(body);
    });
  }
});

const port = 3001;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
