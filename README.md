# 🧩 PuzzleKids - Interactive Educational Puzzle Platform

A modern, full-stack web application designed as an educational puzzle game platform for children. PuzzleKids combines engaging drag-and-drop mechanics with beautiful visual content to create an interactive learning experience.

## 🎯 Project Overview

PuzzleKids is a React-based puzzle game that challenges children to solve interactive puzzles by dragging and dropping pieces into their correct positions. The application features a responsive design, real-time progress tracking, and a comprehensive dashboard for monitoring learning achievements.

## ✨ Key Features

### 🎮 Interactive Puzzle System
- **Drag-and-Drop Mechanics**: Intuitive puzzle piece manipulation using SVG.js
- **Multiple Difficulty Levels**: Easy, Medium, and Hard puzzles
- **Real-time Timer**: Track completion time for each puzzle
- **Dynamic Content**: Fetches puzzle data from Azure Blob Storage
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### 📊 Progress Tracking & Analytics
- **Completion Statistics**: Track total puzzles solved and best times
- **Personal Dashboard**: Detailed progress overview with achievements
- **Performance Metrics**: Average completion times and favorite solving times
- **Achievement System**: Trophy and star-based reward system

### 🔍 Search & Discovery
- **Advanced Search**: Find puzzles by name or description
- **Tag-based Filtering**: Filter puzzles by categories and themes
- **Smart Recommendations**: AI-powered puzzle suggestions based on completion history
- **Progress-based Sorting**: Prioritize incomplete puzzles in recommendations

### 🎨 Modern User Experience
- **Beautiful UI**: Gradient backgrounds and modern design elements
- **Celebration Animations**: Dynamic completion messages and effects
- **Toast Notifications**: Real-time user feedback
- **Responsive Layout**: Optimized for all screen sizes

## 🏗️ Architecture

### Frontend Stack
- **Framework**: React 19 with Create React App
- **Styling**: Tailwind CSS with custom UI components
- **UI Library**: Comprehensive Radix UI component library (40+ components)
- **Routing**: React Router DOM for navigation
- **State Management**: React hooks and localStorage for persistence
- **Build Tool**: CRACO for enhanced configuration
- **Deployment**: GitHub Pages ready



## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Yarn package manager

### Frontend Setup
```bash
cd frontend
yarn install
yarn start
```

The application will be available at `http://localhost:3000`

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python server.py
```

The API will be available at `http://localhost:8000`

### Environment Variables
Create a `.env` file in the backend directory:
```env
MONGO_URL=your_mongodb_connection_string
DB_NAME=your_database_name
```

## 📁 Project Structure

```
puzzlekids/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/ui/    # Radix UI components
│   │   ├── pages/           # Main application pages
│   │   ├── utils/           # Utility functions
│   │   └── hooks/           # Custom React hooks
│   ├── public/              # Static assets
│   └── package.json         # Frontend dependencies
├── backend/                 # FastAPI server
│   ├── server.py           # Main server file
│   └── requirements.txt    # Python dependencies
└── tests/                  # Test files
```

## 🎯 Target Audience

- **Primary**: Children aged 5-12 learning through interactive puzzles
- **Secondary**: Parents and educators seeking educational games
- **Use Case**: Educational institutions, homeschooling, family entertainment

## 🔧 Development

### Available Scripts

#### Frontend
- `yarn start` - Start development server
- `yarn build` - Build for production
- `yarn test` - Run test suite
- `yarn deploy` - Deploy to GitHub Pages

#### Backend
- `python server.py` - Start FastAPI server
- `pytest` - Run backend tests
- `black .` - Format Python code
- `isort .` - Sort Python imports

### Code Quality
- **Frontend**: ESLint configuration for code quality
- **Backend**: Black, isort, flake8, and mypy for Python code quality
- **Testing**: Comprehensive test coverage for both frontend and backend

## 🌟 Features in Detail

### Puzzle Mechanics
- SVG-based interactive puzzle pieces
- Drag-and-drop functionality with visual feedback
- Automatic completion detection
- Reset functionality for puzzle restart

### Data Management
- Azure Blob Storage integration for puzzle content
- Local storage for user progress and preferences
- Real-time data synchronization
- Fallback mechanisms for offline functionality

### User Interface
- Responsive design with mobile-first approach
- Accessibility features for inclusive design
- Smooth animations and transitions
- Intuitive navigation and user flow

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Radix UI** for the comprehensive component library
- **Tailwind CSS** for the utility-first CSS framework
- **SVG.js** for interactive SVG manipulation
- **FastAPI** for the modern Python web framework

---

**Built with ❤️ for educational purposes**
