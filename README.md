# Live Video Sessions Application

A full-stack web application for creating and managing live video sessions with React.js frontend and Node.js backend.

## 🚀 Features

- **Admin Dashboard**: Create sessions with a single click
- **Session Management**: Automatically generate unique session IDs and URLs
- **Video Player**: Full-featured video player with:
  - Play/Pause controls
  - Volume control
  - Progress bar with seek functionality
  - Fullscreen mode
  - Playback speed control (0.5x, 1x, 1.5x, 2x)
  - Audio/Video settings
- **Student Access**: Students can join sessions using unique URLs
- **MongoDB Database**: Persistent session storage

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** package manager

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

### Admin/Host:

1. Open your browser and navigate to `http://localhost:3000`
2. Click the **START SESSION** button
3. A new session will be created with a unique ID
4. Copy the generated session URL
5. Share the URL with students/users
6. The video player will appear with full controls

### Student/User:

1. Open the session URL shared by the admin (e.g., `http://localhost:3000/session/abc-123-xyz`)
2. The video player will load automatically
3. Full controls are available:
   - Play/Pause
   - Volume adjustment
   - Seek through video
   - Fullscreen mode
   - Settings (playback speed)

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

## 📦 Dependencies

### Backend
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `uuid` - Generate unique IDs
- `dotenv` - Environment variables
- `cors` - Cross-origin resource sharing

### Frontend
- `react` - UI library
- `react-router-dom` - Routing
- `axios` - HTTP client
- `vite` - Build tool

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
