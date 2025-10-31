# Screen Sharing Platform with Agora

A full-stack web application for real-time screen sharing using Agora RTC SDK. Host can share their screen with viewers through a unique shareable link.

## 🚀 Features

- **Host Dashboard**: Create screen sharing sessions with one click
- **Real-Time Screen Sharing**: Share your screen instantly using Agora RTC
- **Audio Support**: Includes microphone audio during screen sharing
- **Unique Session URLs**: Each session gets a unique shareable URL
- **Multiple Viewers**: Support for unlimited viewers per session
- **Automatic Reconnection**: Robust error handling and connection management
- **MongoDB Database**: Persistent session storage
- **Responsive Design**: Works on desktop and mobile devices

## 📋 Prerequisites

Before running this application, make sure you have the following:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** package manager
- **Agora Account** - Sign up at [Agora.io](https://www.agora.io/) to get App ID and Certificate
- **Modern Browser** - Chrome, Firefox, or Edge (for screen sharing support)

## 🛠️ Installation & Setup

### 1. Clone or navigate to the project directory

```bash
cd C:\Users\seaen\OneDrive\Desktop\pers-project\video-conference
```

### 2. Install MongoDB (if not already installed)

**Windows:**
- Download MongoDB from [mongodb.com](https://www.mongodb.com/try/download/community)
- Install and start MongoDB service
- Default connection: `mongodb://localhost:27017`

### 3. Set up Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start MongoDB (if not running as a service)
# Open a new terminal and run:
mongod

# Start the backend server
npm start
```

The backend server will run on `http://localhost:5000`

### 4. Set up Frontend

Open a **new terminal** and run:

```bash
# Navigate to frontend directory
cd C:\Users\seaen\OneDrive\Desktop\pers-project\video-conference\frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:3000`

## 🎯 Usage

### Host:

1. Open your browser and navigate to `http://localhost:3000`
2. Click the **START SESSION** button
3. A new session will be created with a unique ID and URL
4. **IMPORTANT**: Grant screen sharing permissions when prompted by your browser
5. Your screen will automatically start sharing
6. Copy the generated session URL using the **Copy URL** button
7. Share the URL with viewers who want to watch your screen
8. Use **Stop Sharing** button to end screen sharing

### Viewer:

1. Open the session URL shared by the host (e.g., `http://localhost:3000/session/abc-123-xyz`)
2. Wait for the host to start sharing their screen
3. The shared screen will appear automatically
4. Audio from the host's microphone will also be streamed
5. You can watch in fullscreen by clicking the fullscreen button (if available)

## 📁 Project Structure

```
video-conference/
├── backend/
│   ├── models/
│   │   └── Session.js          # MongoDB session schema
│   ├── .env                     # Environment variables
│   ├── package.json             # Backend dependencies
│   └── server.js                # Express server
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── VideoPlayer.jsx  # Video player component
│   │   ├── pages/
│   │   │   ├── AdminPage.jsx    # Admin dashboard
│   │   │   └── SessionPage.jsx  # Student session page
│   │   ├── App.jsx              # Main app component
│   │   ├── App.css              # App styles
│   │   ├── main.jsx             # React entry point
│   │   └── index.css            # Global styles
│   ├── index.html               # HTML template
│   ├── package.json             # Frontend dependencies
│   └── vite.config.js           # Vite configuration
│
└── README.md                    # This file
```

## 🗄️ Database Schema

**Collection**: `livesessions`

| Field      | Type      | Description                    |
|------------|-----------|--------------------------------|
| _id        | ObjectId  | Auto-generated MongoDB ID      |
| type       | String    | User type (admin/student)      |
| unique_id  | String    | Unique session identifier      |
| userurl    | String    | Complete session URL           |
| createdAt  | Date      | Timestamp (auto-generated)     |
| updatedAt  | Date      | Timestamp (auto-generated)     |

## 🔧 API Endpoints

### Create Session
- **POST** `/api/sessions`
- Creates a new admin session
- Returns session details with unique URL

### Get Session by ID
- **GET** `/api/sessions/:uniqueId`
- Retrieves session information
- Used when students join via URL

### Get All Sessions
- **GET** `/api/sessions`
- Returns all sessions (sorted by creation date)

## 🎨 Customization

### Change Video Source
Edit `frontend/src/components/VideoPlayer.jsx`:
```jsx
<source src="YOUR_VIDEO_URL_HERE" type="video/mp4" />
```

### Change Ports
- **Backend**: Edit `backend/.env` → `PORT=5000`
- **Frontend**: Edit `frontend/vite.config.js` → `port: 3000`

### MongoDB Connection
Edit `backend/.env`:
```
MONGODB_URI=mongodb://localhost:27017/live_sessions
```

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check connection string in `backend/.env`

### Port Already in Use
- Change port in configuration files
- Or kill the process using the port

### CORS Issues
- Backend already configured with CORS
- Check `backend/server.js` if issues persist

### Screen Sharing Permission Denied
- Make sure to allow screen sharing when prompted
- Check browser settings for screen capture permissions
- Try using Chrome or Edge (best compatibility)

### Agora Connection Issues
- Verify your Agora App ID and Certificate in `backend/.env`
- Check console logs for specific Agora error messages
- Ensure firewall allows WebRTC connections

### Screen Not Appearing for Viewers
- Make sure host has started sharing
- Check browser console for connection errors
- Verify both host and viewer are using valid tokens
- Try refreshing the viewer page

## 📦 Dependencies

### Backend
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `uuid` - Generate unique IDs
- `dotenv` - Environment variables
- `cors` - Cross-origin resource sharing
- `agora-access-token` - Agora RTC token generation

### Frontend
- `react` - UI library
- `react-router-dom` - Routing
- `axios` - HTTP client
- `vite` - Build tool
- `agora-rtc-sdk-ng` - Agora RTC SDK for screen sharing

## 🚀 Production Deployment

### Backend
```bash
cd backend
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

## 📝 License

This project is open source and available for educational purposes.

## 👥 Author

Created for the second round qualification task.

## 🤝 Support

For issues or questions, please check:
1. MongoDB is running
2. All dependencies are installed
3. Ports 3000 and 5000 are available
4. Environment variables are correctly set
