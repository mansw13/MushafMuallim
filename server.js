const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const app = express();
const PORT = process.env.PORT || 3000;
// mongodb+srv://mansw78:MpYbUL14aAm9tRc3@mshftest.ie0jx.mongodb.net/?retryWrites=true&w=majority&appName=MSHFTest
// MongoDB connection
mongoose.connect('mongodb://localhost:27017/mushaf', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

// Session schema
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
    store: MongoStore.create({ mongoUrl: 'mongodb+srv://mansw78:MpYbUL14aAm9tRc3@mshftest.ie0jx.mongodb.net/?retryWrites=true&w=majority&appName=MSHFTest' }),
  })
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