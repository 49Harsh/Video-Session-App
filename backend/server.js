const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
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

// Generate Agora token
app.post('/api/sessions/token', (req, res) => {
  try {
    const { channelName, role } = req.body;
    
    console.log('🔑 Token request:', { channelName, role });
    
    // Validate inputs
    if (!channelName) {
      return res.status(400).json({
        success: false,
        error: 'Channel name is required'
      });
    }
    
    if (!role || (role !== 'host' && role !== 'viewer')) {
      return res.status(400).json({
        success: false,
        error: 'Valid role (host or viewer) is required'
      });
    }
    
    const appID = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;
    
    // Validate Agora credentials
    if (!appID || !appCertificate) {
      console.error('❌ Missing Agora credentials in .env file');
      return res.status(500).json({
        success: false,
        error: 'Server configuration error: Missing Agora credentials'
      });
    }
    
    const uid = 0; // 0 means any user
    const expirationTimeInSeconds = 3600; // 1 hour
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
    
    const agoraRole = role === 'host' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
    
    const token = RtcTokenBuilder.buildTokenWithUid(
      appID,
      appCertificate,
      channelName,
      uid,
      agoraRole,
      privilegeExpiredTs
    );
    
    console.log('✅ Token generated successfully for role:', role);
    
    res.json({ token, appId: appID });
  } catch (error) {
    console.error('❌ Token generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create new session
app.post('/api/sessions', async (req, res) => {
  try {
    const uniqueId = uuidv4();
    const userUrl = `${BASE_URL}/session/${uniqueId}`;
    
    const session = new Session({
      type: 'admin',
      unique_id: uniqueId,
      userurl: userUrl,
      agoraChannelName: uniqueId,
      isActive: true
    });
    
    await session.save();
    
    res.json({
      success: true,
      session: {
        id: session._id,
        type: session.type,
        unique_id: session.unique_id,
        userurl: session.userurl,
        agoraChannelName: session.agoraChannelName
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
        userurl: session.userurl,
        agoraChannelName: session.agoraChannelName
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
