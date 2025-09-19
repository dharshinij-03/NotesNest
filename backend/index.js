//Load Environment varaibles from .env
require('dotenv').config();
//Import express web frameword
const express = require('express')
// Import Passport(authentication)
const passport = require('passport')
//Import express session
const session = require('express-session')

var GoogleStrategy = require('passport-google-oauth20').Strategy;

//Create an express application
const app = express();

app.use(session({
    secret : "secret",
    resave: false,
    saveUninitialized:true
}));
//Initialize Passport
app.use(passport.initialize())

//tell Passport to use the session
app.use(passport.session());


passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:4000/auth/google/callback"
},
function(accessToken, refreshToken, profile, done) {
  return done(null, profile);   
}));   


passport.serializeUser((user,done) =>done(null,user));  //save user to session
passport.deserializeUser((user,done) =>done(null,user)); // Read the user to session

app.get('/',(req,res) =>{
    res.send("<a href='/auth/google'>Login with Google</a>")
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile','email'] }));


app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/profile');
  });
app.get('/profile',(req,res) =>{
        res.send(`Welcome ${req.user.displayName}`);
    });
app.get('/logout',(req,res)=>{
   req.logout(()=>{
    res.redirect("/")
   })
});

app.listen(4000,() =>{console.log('Server is listening to http://localhost:4000')});

