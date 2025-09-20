require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const app = express();
app.use(express.json());

// allow frontend requests
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// session middleware
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ======================
// MongoDB + Notes Schema
// ======================
mongoose
  .connect("mongodb://127.0.0.1:27017/notesnest")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ Mongo Error:", err));

const noteSchema = new mongoose.Schema(
  {
    title: String,
    details: String,
    userId: String, // <-- attach to Google user
  },
  { timestamps: true }
);

const Note = mongoose.model("Note", noteSchema);

// ======================
// Auth Middleware
// ======================
function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: "Unauthorized" });
}

// ======================
// CRUD Routes for Notes
// ======================

// Get notes for logged-in user only
app.get("/api/notes", ensureAuth, async (req, res) => {
  const notes = await Note.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json(notes);
});

// Create note for user
app.post("/api/notes", ensureAuth, async (req, res) => {
  try {
    const note = await Note.create({
      title: req.body.title,
      details: req.body.details,
      userId: req.user.id,
    });
    res.status(201).json(note);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Update note (only if owned by user)
app.put("/api/notes/:id", ensureAuth, async (req, res) => {
  try {
    const updated = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { title: req.body.title, details: req.body.details },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Delete note (only if owned by user)
app.delete("/api/notes/:id", ensureAuth, async (req, res) => {
  try {
    const deleted = await Note.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ======================
// Google Login Setup
// ======================
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID, // set in .env
      clientSecret: process.env.GOOGLE_CLIENT_SECRET, // set in .env
      callbackURL: "http://localhost:4000/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Routes for Google Auth
app.get("/", (req, res) => {
  res.send("<a href='/auth/google'>Login with Google</a>");
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("http://localhost:3000"); // redirect to frontend
  }
);

// API to get user info
app.get("/api/user", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.json({ user: null });
  }
});

app.get("/logout", (req, res, next) => {
  req.logout(function(err) {
    if (err) return next(err);

    // destroy session and clear cookie
    req.session.destroy(() => {
      res.clearCookie("connect.sid"); // clear session cookie
      res.json({ success: true });    // return JSON instead of redirect
    });
  });
});


// ======================
// Start Server
// ======================
app.listen(4000, () =>
  console.log("🚀 Server running on http://localhost:4000")
);
