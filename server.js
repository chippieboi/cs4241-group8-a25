require('dotenv').config();
console.log("MongoDB URI:", process.env.MONGO_URI); 
const express = require('express'),
  fs = require('fs'),
  mime = require('mime'),
  dir = 'public/',
  port = 3000,
  app = express(),
  path = require('path'),
  bcrypt = require('bcrypt'),
  saltRounds = 10;
const jwt = require("jsonwebtoken");
const cookieParser = require('cookie-parser');

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const TOKENKEY = "ThisIsASecretTokenKey"

const uri = process.env.MONGO_URI;
console.log("MongoDB URI:", process.env.MONGO_URI);
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

    //res.status(201).json({ message: "User registered successfully" });
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

app.get("/leaderboard", async (req, res) => {
  try {
    const leaderboard = await animalsCollection.aggregate([
      {
        $group: {
          _id: "$username",
          totalGold: {$sum: {$toInt: "$gold"}},
          totalSilver: {$sum: {$toInt: "$silver"}},
          totalBronze: {$sum: {$toInt: "$bronze"}}
        }
      },
      {
        $sort: {
          totalGold: -1,
          totalSilver: -1,
          totalBronze: -1
        }
      }
    ]).toArray()

    res.json(leaderboard)
  } catch (err) {
    console.error("Leaderboard error: ", err)
    res.status(500).json({error: "Internal server error."})
  }
})

app.get("/loadAnimals", authenticateToken, async (req, res) => {
  try {
    const username = req.user.username;
    if (!username) return res.status(401).json({error: "Not authenticated"})

    const animals = await animalsCollection.find({username}).toArray()
    res.json(animals);
  } catch (err) {
    console.error("loadAnimals error:", err);
    res.status(500).json({error: "Internal server error"});
  }
});

app.post("/createAnimal", authenticateToken, async (req, res) => {
  try{
    const { name, type , speed, stamina, agility, dexterity} = req.body;
    if (!name || !type) return res.status(400).json({error: "Missing name or type"});

    const stats = [speed, stamina, agility, dexterity].map(Number);
    const total = speed + stamina + agility + dexterity;
    if (total > 30) return res.status(400).json({ error: "Stat total exceeds 30 points"});

    const username = req.user.username;

    const animal = {
      username,
      name,
      type,
      speed: stats[0],
      stamina: stats[1], 
      agility: stats[2], 
      dexterity: stats[3],
      wins: 0,
      gold: 0,
      silver: 0,
      bronze: 0
    };

    const result = await animalsCollection.insertOne(animal);
    res.json({success: true, animal: {...animal, _id: result.insertedId}});
  } catch (err) {
    console.error("createAnimal error:", err);
    res.status(500).json({error: "Internal server error"});
  }
});

app.put("/editAnimal/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, speed, stamina, agility, dexterity } = req.body;

    const total = speed + stamina + agility + dexterity;
    if (total > 30) return res.status(400).json({ error: "Stat total exceeds 30 points" });

    const username = req.user.username;

    const result = await animalsCollection.findOneAndUpdate(
      { _id: new ObjectId(id), username },
      { $set: { name, type, speed, stamina, agility, dexterity } },
      { returnDocument: "after" }
    );

    if (!result.value) return res.status(404).json({ error: "Animal not found" });
    res.json({ success: true, animal: result.value });
  } catch (err) {
    console.error("editAnimal error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/deleteAnimal/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const username = req.user.username;

    const result = await animalsCollection.deleteOne({ _id: new ObjectId(id), username });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Animal not found or not owned by user" });
    }

    res.json({ success: true, message: "Animal deleted successfully" });
  } catch (err) {
    console.error("deleteAnimal error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});



app.get("/viewHistory", authenticateToken, async (req, res) => {
  const user = await usersCollection.findOne({ username: req.user.username })
  const animals = await animalsCollection.find({username: user.username}).toArray()
  let animalHistory = []
  for (let animal of animals) {
    animalHistory = await historyCollection.find({$or: [
      {first: animal._id},
      {second: animal._id},
      {third: animal._id},
      {fourth: animal._id}
    ]}).toArray()  
  }
  res.json(animalHistory)
})

app.get("/animals", authenticateToken, async (req, res) => {
  try {
    const username = req.user.username;

    const animals = await animalsCollection.find({username}).toArray();

    res.json(animals);
  } catch (err) {
    console.error("error fetching ainmals");
    res.status(500).json({error: "fetching animals error"});
  }
});

app.post("/race", authenticateToken, async (req, res) => {
  try{
    const { animalId } = req.body;

    const userAnimal = await animalsCollection.findOne({_id: ObjectId.createFromHexString(animalId)});
    if(!userAnimal){
      return res.status(400).json({error: "Animal not found"});
    }

    const user = await usersCollection.findOne({username: req.user.username});
    const username = user.username

    const opponents = await animalsCollection.aggregate([
      {$match: {username: {$ne: username}, _id: {$ne: ObjectId.createFromHexString(animalId)}}},
      {$sample: {size: 4}}
    ]).toArray();

    const racers = [userAnimal, ...opponents];

    const { results, title, modifiers } = simulateRace(racers);

    const db = client.db('finaldb')
    await updateMedals(db, results);

    if(results.length < 5) {
      return res.status(400).json({error: "not enough animals for race"});
    }

    const raceDoc = {
      title,
      first: results[0]._id,
      second: results[1]._id,
      third: results[2]._id,
      fourth: results[3]._id,
      fifth: results[4]._id,
    }

    await historyCollection.insertOne(raceDoc);

    res.json({
      title,
      results: results.map((r, i) => ({
        place: i + 1,
        name: r.name,
        username: r.username,
        score: r.finalScore.toFixed(2)
    }))
  });
  }catch (err){
    res.status(500).json({error: "failed to start race" + err});
  }
  
})

async function updateMedals(db, results) {
  const medals = ["gold", "silver", "bronze"];
  for (let i = 0; i < 3 && i < results.length; i++) {
    const inc = { $inc: { [medals[i]]: 1}};
    await animalsCollection.updateOne({_id: results[i]._id}, inc);
  }
}

function simulateRace(racers) {
  const modifiers = {
    speed: 1 + Math.random(),
    stamina: 1 + Math.random(),
    agility: 1 + Math.random(),
    dexterity: 1 + Math.random()
  };

  const sortedMods = Object.entries(modifiers).sort((a, b) => b[1] - a[1]);
  const [highestStat, secondHighestStat] = [sortedMods[0][0], sortedMods[1][0]];

  const title = generateRaceTitle(highestStat, secondHighestStat);
  const results = racers.map(r => {
    

    const total = r.speed * modifiers.speed + r.stamina * modifiers.stamina +
                  r.agility * modifiers.agility + r.dexterity * modifiers.dexterity;
    const variance = 0.9 + Math.random() * 0.2;
    const finalScore = total * variance;

    return {...r, finalScore};
  }).sort((a, b) => b.finalScore - a.finalScore);

  return { results, title, modifiers};
}

function generateRaceTitle(highest, secondHighest) {
  const titles = {
    speed: ["Sprint", "Speedy"],
    stamina: ["Decathalon", "Endurance"],
    agility: ["Parkour", "Nimble"],
    dexterity: ["Steeplechase", "Refined"],
  };

  const [main, secondary] = [
    titles[highest]?.[0] || "unknown",
    titles[secondHighest]?.[1] || "unknown"
  ];

  return `${secondary} ${main}`
}

app.post('/viewAnimal', authenticateToken, async (req, res) => {
  const animalId = req.body.animalId
  if (!animalId) {
    return res.status(400).json({error: "Animal ID is required."})
  }
  try {
    const _id = ObjectId.isValid(animalId) ? new ObjectId(animalId) : animalId
    const animals = await animalsCollection.findOne({_id})
    if (!animals) return res.status(404).json({ error: 'Animal not found' })
    return res.json({
      id: animals._id.toString(),
      name: animals.name,
      type: animals.type,
      speed: animals.speed,
      stamina: animals.stamina,
      agility: animals.agility,
      dexterity: animals.dexterity,
      username: animals.username
    })
  } catch (err) {
    console.error('viewAnimal error', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
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