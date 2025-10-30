const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const Session = require('./models/Session');

const app = express();
const PORT = process.env.PORT || 5000;
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// API Routes

// Create new session
app.post('/api/sessions', async (req, res) => {
  try {
    const uniqueId = uuidv4();
    const userUrl = `${BASE_URL}/session/${uniqueId}`;
    
    const session = new Session({
      type: 'admin',
      unique_id: uniqueId,
      userurl: userUrl
    });
    
    await session.save();
    
    res.json({
      success: true,
      session: {
        id: session._id,
        type: session.type,
        unique_id: session.unique_id,
        userurl: session.userurl
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get session by unique_id
app.get('/api/sessions/:uniqueId', async (req, res) => {
  try {
    const session = await Session.findOne({ unique_id: req.params.uniqueId });
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    res.json({
      success: true,
      session: {
        id: session._id,
        type: session.type,
        unique_id: session.unique_id,
        userurl: session.userurl
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all sessions
app.get('/api/sessions', async (req, res) => {
  try {
    const sessions = await Session.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      sessions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
