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

const { MongoClient, ServerApiVersion } = require('mongodb')

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
app.use(express.static(dir))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.post('/login', async(req, res) => {
  const {username, password} = req.body

  let user = await usersCollection.findOne({username})

  if (!user) {
    const hash = await bcrypt.hash(password, saltRounds)
    await usersCollection.insertOne({username, password: hash})

    return res.status(200).json({"message": "Account successfully created and logged in."})
  }

  const match = await bcrypt.compare(password, user.password)
  if (!match) {
    return res.status(400).json({"message": "Incorrect credentials."})
  }

  return res.status(200).json({"message": ""})
})

app.listen(process.env.PORT || port )