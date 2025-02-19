const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;
const username = encodeURIComponent("mansw78");
const password = encodeURIComponent("MpYbUL14aAm9tRc3");
const { ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${username}:${password}@mshftest.ie0jx.mongodb.net/?retryWrites=true&w=majority&appName=MSHFTest`;


// Connect to MongoDB
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
  socketTimeoutMS: 45000, // Increase socket timeout to 45 seconds
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

// Log connection status
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});
mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});
mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
});
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
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
    const database = client.db("mhftest");
    const ratings = database.collection("collection1");
   
  } finally {
    // TODO: Ensure that the client will close when you finish/error
    console.log("Connection closed???");
  }
}
run().catch(console.dir);
console.log("Connection closed2");

// Define a schema for the session data
const sessionSchema = new mongoose.Schema({
 // sessionId: String,
  inputData: [String],
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  sessionId: { type: String, required: true },
});

//const User = mongoose.model('User', userSchema);
const Session = mongoose.model('Session', sessionSchema);

// Middleware to parse JSON
app.use(express.json());
// Session middleware
app.use(
  session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    
  })
);
// Middleware to parse JSON


// Route to save session data
app.post('/save-session', async (req, res) => {
  console.log('Request body:', req.body);
  const { userId, inputData } = req.body;

  try {
      console.log('No User session:');
      // Save the session data
      const database = mongoose.connection.db;
      const collection = database.collection('collection1');
      const result = await collection.insertOne(
        { userId },
        {$set: {inputData}},
        { upsert: true }
      
      );
      console.log(`${result.insertedCount} documents were inserted with the _id: ${result.insertedId}`);
   

      console.log(`Session for user ${userId} saved/updated with result: ${result}`);
   
 //     await userSession.save();
    res.status(200).send('Session saved successfully: ${sessionId}'); 
  } catch (error) {
    console.error('Error saving session:', error);
    res.status(500).send('Error saving session');
  }
});


app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await mongoose.connection.db.collection('users').findOne({ username, password });
    if (user) {
      const sessionData = await mongoose.connection.db.collection('sessions').findOne({ userId: user.userId });
      res.status(200).json({ message: 'Login successful', user });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/add-user', async (req, res) => {
  const { username, password } = req.body;

  try {
    const userCount = await mongoose.connection.db.collection('users').countDocuments();
    const userId = `user${userCount + 1}`;
    const newUser = { userId, username, password };

    await mongoose.connection.db.collection('users').insertOne(newUser);
    res.status(200).json({ message: 'User added successfully', newUser });
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 