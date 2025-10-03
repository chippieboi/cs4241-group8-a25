const express = require('express'),
  fs = require('fs'),
  mime = require('mime'),
  dir = 'public/',
  port = 3000,
  app = express(),
  path = require('path')
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

app.listen(process.env.PORT || port )