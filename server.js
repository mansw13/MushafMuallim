const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const app = express();
const PORT = process.env.PORT || 3000;
const username = encodeURIComponent("mansw78");
const password = encodeURIComponent("MpYbUL14aAm9tRc3");
// mongodb+srv://mansw78:MpYbUL14aAm9tRc3@mshftest.ie0jx.mongodb.net/?retryWrites=true&w=majority&appName=MSHFTest
// MongoDB connection
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://mansw78:MpYbUL14aAm9tRc3@mshftest.ie0jx.mongodb.net/?retryWrites=true&w=majority&appName=MSHFTest";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Connected successfully to server");

    const database = client.db("mhftest");
    console.log("Connected successfully to mhftest");
    const ratings = database.collection("collection1");
    console.log("Connected successfully to collection1");
    const cursor = ratings.find();
    await cursor.forEach(doc => console.dir(doc));
  } finally {
    await client.close();
  }
}
run().catch(console.dir);

const sessionSchema = new mongoose.Schema({
  sessionId: String,
  revealedAyah: [String],
  markedWords: [String],
  unmarkedWords: [String],
});

const Session = mongoose.model('Session', sessionSchema);

// Middleware to parse JSON
app.use(express.json());

// Session middleware
app.use(
  session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
     }),
);

// Route to save session data
app.post('/save-session', async (req, res) => {
  const { sessionId, revealedAyah, markedWords, unmarkedWords } = req.body;

  try {
    let userSession = await Session.findOne({ sessionId });

    if (!userSession) {
      userSession = new Session({ sessionId, revealedAyah, markedWords, unmarkedWords });
    } else {
      userSession.revealedAyah = revealedAyah;
      userSession.markedWords = markedWords;
      userSession.unmarkedWords = unmarkedWords;
    }

    await userSession.save();
    res.status(200).send('Session saved successfully');
  } catch (error) {
    console.error('Error saving session:', error);
    res.status(500).send('Error saving session');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 