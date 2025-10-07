const express = require('express'),
  fs = require('fs'),
  mime = require('mime'),
  dir = 'public/',
  port = 3000,
  app = express(),
  path = require('path'),
  bcrypt = require('bcrypt'),
  saltRounds = 10
require('dotenv').config()
const jwt = require("jsonwebtoken");
const cookieParser = require('cookie-parser');

const { MongoClient, ServerApiVersion } = require('mongodb')
const TOKENKEY = "ThisIsASecretTokenKey"

const uri = process.env.MONGO_URI
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let animalsCollection
let usersCollection
let historyCollection

async function initDB() {
  try {
    await client.connect()
    const db = client.db('finaldb')
    animalsCollection = db.collection('animals')
    usersCollection = db.collection('users')
    historyCollection = db.collection('history')
    console.log("Successfully connected.")
  } catch (err) {
    console.log("DB connection error: ", err)
  }
}
initDB()

app.use(express.json())
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }))
app.use(express.static(dir, { index: false }))

function authenticateToken(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return res.redirect('/login');

  jwt.verify(token, TOKENKEY, (err, user) => {
    if (err) return res.redirect('/login');
    req.user = user;
    next();
  });
}

app.get('/', authenticateToken, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'))
})

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  try {
    const user = await usersCollection.findOne({ username });

    if (!user) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const token = jwt.sign({ username: user.username }, TOKENKEY, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true, path: '/' });
    return res.redirect('/');
  } catch (err) {
    console.error("Login error: ", err);
    res.status(500).json({ error: "Internal server error" });
  }
})

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'))
})

app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  try {
    const existingUser = await usersCollection.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await usersCollection.insertOne({ username, password: hashedPassword });

    res.status(201).json({ message: "User registered successfully" });
    return res.redirect('/login');
  } catch (err) {
    console.error("Registration error: ", err);
    res.status(500).json({ error: "Internal server error" });
  }
})

app.post('/logout', (req, res) => {
  res.clearCookie('token', { path: '/' });
  res.redirect('/login');
})
async function startServer() {
  const maxWaitMs = 3000
  const start = Date.now()
  while ((!usersCollection || !animalsCollection || !historyCollection) && Date.now() - start < maxWaitMs) {
    await new Promise(r => setTimeout(r, 100))
  }

  app.listen(process.env.PORT || port, () => {
    console.log(`Server listening on port ${process.env.PORT || port}`)
  })
}

/*
/create animal
/edit animal      - edit animal
/view history     - show history for the user (as opposed to animal specific)
/race             - handle selecting other users' animals to race against, calculating who wins, displaying race info
                  - insert related info into history table, update animal table (maybe user table if user also tracks total wins)
/view animals     - show all animals of a given user
/leaderboard      - show the users with the most wins

animal types:
horse,      cat,       dog,      kangaroo
+5speed, +5agility, +5stamina, +5dexterity

attributes add up to 30

animal table:
name - animal type - speed - stamina - agility - dexterity - wins - user

history table:
animal - position - race title - user

race info:  some flavor text that we generate based on the random numbers

race gen:
generate random number 1-2 for each of the 4 stats
multiply final number by rng(0.9,1.1) inclusive

start with user can't see the race, just click a button and call /race,
- can add seeing the race functionality later
*/

startServer()