# 👨‍💻 Developer Setup Guide

Complete guide for setting up your development environment for the ESG Platform.

## 🖥️ System Requirements

### Minimum Requirements
- **OS**: Windows, macOS, or Linux
- **RAM**: 4GB (8GB recommended)
- **Disk**: 2GB free space
- **CPU**: Dual-core (2.0GHz+)

### Recommended Setup
- **OS**: Ubuntu 20.04+ or macOS 12+
- **RAM**: 16GB
- **Disk**: 10GB NVMe SSD
- **CPU**: Quad-core or better

## 📋 Prerequisites

### 1. Git
```bash
# Windows: Download from https://git-scm.com/
# macOS: brew install git
# Linux: sudo apt-get install git

# Verify installation
git --version
```

### 2. Python 3.8+
```bash
# Download from https://www.python.org/
# Or use package manager:
# macOS: brew install python3
# Linux: sudo apt-get install python3

# Verify installation
python3 --version
```

### 3. Node.js & npm
```bash
# Download from https://nodejs.org/
# Or use package manager:
# macOS: brew install node
# Linux: sudo apt-get install nodejs npm

# Verify installation
node --version
npm --version
```

### 4. Git Clone the Repository
```bash
git clone https://github.com/yourusername/esg-platform.git
cd esg-platform
```

## 🔧 Backend Setup

### Step 1: Create Virtual Environment

```bash
cd backend

# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### Step 2: Install Dependencies

```bash
# Upgrade pip
pip install --upgrade pip

# Install requirements
pip install -r requirements.txt

# Verify installation
pip list
```

### Step 3: Create Environment File

Create `backend/.env`:
```
FLASK_ENV=development
FLASK_DEBUG=1
DATABASE_URL=sqlite:///esg_platform.db
SECRET_KEY=your-development-secret-key-not-for-production
API_HOST=127.0.0.1
API_PORT=5000
```

### Step 4: Initialize Database

The database auto-initializes on first run. If needed, manually:

```python
# In Python shell
from database import init_db
init_db()
print("Database initialized!")
```

### Step 5: Run Backend Server

```bash
python app.py

# Expected output:
# WARNING in app.run_simple
# WARNING: This is a development server. Do not use it in a production environment.
# Serving Flask app 'app'
# Debug mode: on
# Running on http://127.0.0.1:5000
```

✅ Backend running at: `http://127.0.0.1:5000`

## 📦 Frontend Setup

### Step 1: Install Dependencies

```bash
cd frontend

# Install Node packages
npm install

# Install additional packages (if not in package.json)
npm install react-router-dom axios chart.js react-chartjs-2
```

### Step 2: Create Environment File

Create `frontend/.env`:
```
REACT_APP_API_URL=http://127.0.0.1:5000
REACT_APP_ENV=development
```

### Step 3: Run Development Server

```bash
npm start

# Expected output:
# Compiled successfully!
# Local: http://localhost:3000
# On Your Network: http://192.168.x.x:3000
```

✅ Frontend running at: `http://localhost:3000`

## 🧪 Testing

### Backend Testing

```bash
# Test an endpoint with curl
curl http://127.0.0.1:5000/auth/profile \
  -H "X-User-ID: 1"

# Or use Postman:
# URL: http://127.0.0.1:5000/auth/profile
# Headers: X-User-ID: 1
# Method: GET
```

### Frontend Testing

Test authentication flow:
1. Open http://localhost:3000
2. Click "Sign Up"
3. Create account with:
   - Username: testuser
   - Email: test@example.com
   - Password: test123456
4. Verify redirected to login page
5. Login with credentials
6. Verify logged in (sidebar shows, home has logout)

### Database Testing

```python
# In Python shell (from backend directory)
from database import register_user, login_user

# Test registration
register_user("testuser", "test@example.com", "password123")

# Test login
user_id = login_user("testuser", "password123")
print(f"Login successful! User ID: {user_id}")
```

## 🔄 Git Workflow

### Basic Workflow

```bash
# Pull latest changes
git pull origin main

# Create feature branch
git checkout -b feature/my-feature

# Make changes...

# Stage changes
git add .

# Commit changes
git commit -m "Add my feature"

# Push to remote
git push origin feature/my-feature

# Create pull request on GitHub
```

### Branch Naming Convention

```
feature/feature-name       # New feature
bugfix/bug-name           # Bug fix
refactor/component-name   # Code refactoring
docs/documentation-name   # Documentation
hotfix/urgent-fix         # Urgent production fix
```

## 🛠️ Development Tools

### Recommended IDE

#### VS Code (Free)
```bash
# Download from https://code.visualstudio.com/
# Recommended extensions:
# - Python
# - Pylance
# - Prettier
# - ES7+ React
# - Thunder Client (API testing)
```

#### PyCharm (Professional)
```
# Download from https://www.jetbrains.com/pycharm/
# Free for educational use
```

### API Testing Tools

#### Thunder Client (VS Code)
```
Right-click → New Request → Test endpoints
```

#### Postman
```bash
# Download from https://www.postman.com/
# Import collection from docs/postman_collection.json
```

#### cURL
```bash
curl -X GET http://127.0.0.1:5000/health \
  -H "X-User-ID: 1"
```

### Database Browser

#### SQLite Browser
```bash
# macOS: brew install sqlitebrowser
# Windows: Download from https://sqlitebrowser.org/
# Linux: sudo apt-get install sqlitebrowser

# Open database
sqlitebrowser backend/esg_platform.db
```

## 📊 Directory Structure for Development

```
esg-platform/
└── backend/
    ├── venv/                 # Virtual environment (DO NOT commit)
    ├── app.py               # Main Flask app
    ├── database.py          # Database functions
    ├── parser.py            # Document parsing
    ├── model.py             # ESG scoring
    ├── blockchain.py        # Blockchain logic
    ├── rag.py              # Chatbot/RAG
    ├── requirements.txt     # Python dependencies
    ├── .env                # Environment variables
    ├── esg_platform.db     # SQLite database
    └── uploads/            # Uploaded files
        
└── frontend/
    ├── node_modules/        # Node packages (DO NOT commit)
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── pages/           # Page components
    │   ├── components/      # Reusable components
    │   ├── styles/          # CSS files
    │   └── App.js
    ├── package.json
    └── .env                # Environment variables
```

## 🚫 Files to Ignore

Create `.gitignore`:
```
# Python
__pycache__/
*.pyc
*.pyo
venv/
.env
*.db

# Node
node_modules/
npm-debug.log
.env.local

# IDE
.vscode/
.idea/
*.swp
.DS_Store

# OS
.DS_Store
Thumbs.db

# Uploads
backend/uploads/*
!backend/uploads/.gitkeep
```

## 🔍 Debugging

### Backend Debugging

#### In Terminal
```bash
# Add debug logging
import logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)
logger.debug("Message here")
```

#### Using VS Code Debugger
Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Flask",
      "type": "python",
      "request": "launch",
      "module": "flask",
      "env": {
        "FLASK_APP": "app.py",
        "FLASK_ENV": "development"
      },
      "args": ["run"],
      "jinja": true
    }
  ]
}
```

### Frontend Debugging

#### React DevTools
```
Install React Developer Tools browser extension
Press F12 → Components tab
```

#### Console Logging
```javascript
console.log('Debug:', variable);
console.error('Error:', error);
console.table(arrayOfObjects);
```

#### Network Debugging
```
F12 → Network tab
Watch API calls, inspect requests/responses
```

## 🔐 Environment Configuration

### Development (.env)
```
FLASK_ENV=development
FLASK_DEBUG=1
DEBUG=true
API_URL=http://127.0.0.1:5000
```

### Staging (.env.staging)
```
FLASK_ENV=staging
FLASK_DEBUG=0
API_URL=https://staging-api.example.com
```

### Production (.env.production)
```
FLASK_ENV=production
FLASK_DEBUG=0
API_URL=https://api.example.com
DATABASE_URL=postgresql://...
SECRET_KEY=<very-secure-key>
```

## 📝 Code Style Guide

### Python (Backend)

```python
# Good
def calculate_esg_score(emissions, renewable_pct, carbon_neutral):
    """Calculate ESG score with weighted formula."""
    score = (emissions * 0.40) + (renewable_pct * 0.30)
    return min(score, 100)

# Avoid
def calc(e, r, c):
    return min((e * 0.40) + (r * 0.30), 100)
```

### JavaScript (Frontend)

```javascript
// Good
function handleUploadClick(event) {
  event.preventDefault();
  const file = fileInput.current.files[0];
  uploadFile(file);
}

// Avoid
const handleUploadClick = (e) => {
  e.preventDefault();
  uploadFile(fileInput.current.files[0]);
};
```

### CSS

```css
/* Good */
.upload-section {
  display: flex;
  gap: 1rem;
  padding: 2rem;
}

.upload-section__form {
  flex: 1;
}

/* Avoid */
.upload-section {
  display: flex;
}

.upload-section .form {
  flex: 1;
}
```

## 🎯 Common Development Tasks

### Add New API Endpoint

1. Define function in `backend/app.py`:
```python
@app.route('/api/new-endpoint', methods=['POST'])
@login_required
def new_endpoint():
    data = request.json
    # Process data
    return jsonify(result)
```

2. Call from frontend:
```javascript
const res = await axios.post('http://127.0.0.1:5000/api/new-endpoint', 
  data,
  { headers: { 'X-User-ID': userId } }
);
```

### Add New React Component

1. Create file: `src/pages/NewPage.js`
2. Add route in `App.js`:
```javascript
<Route path="/new-page" element={<NewPage />} />
```
3. Add link in `Sidebar.js`

### Update Database Schema

1. Edit `database.py` `init_db()` function
2. Delete `esg_platform.db`
3. Restart backend to recreate

### Style a Component

1. Create CSS file: `src/styles/ComponentName.css`
2. Import in component: `import './styles/ComponentName.css'`
3. Use class names in JSX

## 🆘 Troubleshooting

### Python: ModuleNotFoundError

```bash
# Ensure venv is activated
# Then reinstall requirements
pip install -r requirements.txt
```

### Node: npm ERR!

```bash
# Clear npm cache
npm cache clean --force

# Reinstall
rm -rf node_modules
npm install
```

### Port Already in Use

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

### Database Locked Error

```bash
# Stop all Flask instances
# Delete .db file if needed
rm backend/esg_platform.db
# Restart Flask
```

## 📚 Learning Resources

### Python & Flask
- [Flask Documentation](https://flask.palletsprojects.com/)
- [Python Documentation](https://docs.python.org/3/)
- [Real Python Tutorials](https://realpython.com/)

### React & JavaScript
- [React Documentation](https://react.dev/)
- [JavaScript.info](https://javascript.info/)
- [MDN Web Docs](https://developer.mozilla.org/)

### Chart.js & Visualization
- [Chart.js Docs](https://www.chartjs.org/)
- [D3.js](https://d3js.org/) (advanced visualization)

### Database
- [SQLite Tutorial](https://www.sqlitetutorial.net/)
- [SQL Basics](https://www.w3schools.com/sql/)

---

**Ready to develop!** 🚀

Start your servers with:
```bash
# Terminal 1
cd backend && source venv/bin/activate && python app.py

# Terminal 2
cd frontend && npm start
```

Happy coding! 💻
