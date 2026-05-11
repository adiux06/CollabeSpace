# CollabeSpace

CollabeSpace is a high-fidelity project management and collaboration platform built with the MERN stack (MongoDB, Express, React, Node.js). It features real-time task management, workspace synchronization, and a premium glassmorphic UI.

## Features

- **Kanban Board**: Dynamic task management with drag-and-drop functionality.
- **Real-time Collaboration**: Instant updates across clients using Socket.io.
- **Workspace Management**: Organize tasks into different workspaces.
- **Modern UI**: A stunning glassmorphic design with smooth animations and responsive layouts.
- **Authentication**: Secure JWT-based authentication system.

## Tech Stack

### Backend
- **Node.js & Express**: Robust server-side logic.
- **MongoDB & Mongoose**: Flexible NoSQL database and ODM.
- **Socket.io**: Real-time bidirectional communication.
- **JWT**: Secure authentication and authorization.
- **Groq SDK**: AI-powered features integration.

### Frontend
- **React**: Modern component-based UI.
- **Vite**: Ultra-fast build tool and dev server.
- **Framer Motion**: Premium micro-animations and transitions.
- **Tailwind CSS**: Utility-first styling with modern aesthetics.
- **Zustand**: Lightweight state management.
- **Socket.io-client**: Seamless real-time integration.

## Project Structure

```text
CollabeSpace/
├── backend/            # Express server and API
│   ├── src/            # Source code
│   └── scripts/        # Utility and maintenance scripts
├── frontend/           # React application
│   ├── src/            # Components, pages, and logic
│   └── public/         # Static assets
└── docs/               # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB account (local or Atlas)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/CollabeSpace.git
   cd CollabeSpace
   ```

2. Install dependencies for both backend and frontend:
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. Set up environment variables:
   - Copy `backend/.env.example` to `backend/.env` and fill in your credentials.
   - Copy `frontend/.env.example` to `frontend/.env` and adjust the API URL if necessary.

### Running the Application

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`.

## Documentation

For more detailed information, please refer to the files in the `docs/` directory:
- [Setup Guide](docs/SETUP.md)
- [API Documentation](docs/API.md)
- [Architecture Overview](docs/ARCHITECTURE.md)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
