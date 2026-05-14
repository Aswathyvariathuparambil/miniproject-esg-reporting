# 🌍 ESG Carbon Footprint Auditing Platform

A comprehensive web application for carbon footprint auditing, ESG scoring, and sustainability analysis powered by AI and blockchain technology.

## 📋 Features

### ✅ Core Functionality
- **👤 User Authentication**: Secure login/signup system with password hashing
- **📄 Multi-Format Document Support**: Upload and parse PDF, DOCX, and TXT files
- **📊 AI-Powered Data Extraction**: Automatic extraction of ESG and carbon emission data
- **🧮 ESG Score Calculation**: Industry-standard formula with multiple factors:
  - Scope 1, 2, 3 Emissions (40%)
  - Renewable Energy Adoption (30%)
  - Carbon Neutrality Goals (15%)
  - Water & Waste Management (15%)
- **⛓️ Blockchain Storage**: Immutable records of all ESG scores
- **🔍 Anomaly Detection**: Detects unusual changes year-over-year
- **🧠 SHAP Explainability**: AI-powered insights showing which factors drive your score
- **📈 Advanced Dashboard**: Interactive charts and visualizations
- **🤖 AI Chatbot**: RAG-powered assistant for ESG questions
- **👥 Profile & History**: Track reports and chat history

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- React 18
- React Router for navigation
- Chart.js for visualizations
- Axios for API calls
- CSS3 with responsive design

**Backend:**
- Flask (Python)
- SQLite Database
- FAISS for RAG (Retrieval Augmented Generation)
- Sentence Transformers for embeddings
- Blockchain implementation (in-memory)
- Python-docx for Word document parsing
- PDFplumber for PDF extraction

**Database:**
- SQLite (development)
- Supports users, reports, ESG scores, blockchain records, anomalies, and chat history

## 📁 Project Structure

```
esg-platform/
├── backend/
│   ├── app.py                 # Flask main application
│   ├── parser.py              # Document parser (PDF, DOCX, TXT)
│   ├── model.py               # ESG scoring formula & analysis
│   ├── database.py            # SQLite operations
│   ├── blockchain.py          # Blockchain implementation
│   ├── rag.py                 # RAG chatbot system
│   ├── requirements.txt        # Python dependencies
│   └── uploads/               # Uploaded documents
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.js            # Landing page
│   │   │   ├── Login.js           # Login page
│   │   │   ├── Signup.js          # Signup page
│   │   │   ├── Upload.js          # Report upload & analysis
│   │   │   ├── DashboardPage.js   # Dashboard with charts
│   │   │   ├── AnalysisPage.js    # SHAP analysis & insights
│   │   │   └── Profile.js         # User profile & history
│   │   │
│   │   ├── components/
│   │   │   ├── Sidebar.js         # Navigation sidebar
│   │   │   └── Chatbot.js         # AI chatbot widget
│   │   │
│   │   ├── styles/
│   │   │   ├── Auth.css
│   │   │   ├── Home.css
│   │   │   ├── Upload.css
│   │   │   ├── Dashboard.css
│   │   │   ├── Analysis.css
│   │   │   ├── Profile.css
│   │   │   ├── Sidebar.css
│   │   │   └── Chatbot.css
│   │   │
│   │   ├── App.js
│   │   └── index.js
│   │
│   ├── package.json
│   └── README.md
│
└── uploads/                   # File uploads directory
```

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 14+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install flask flask-cors werkzeug pdfplumber python-docx \
               sentence-transformers faiss-cpu numpy matplotlib scipy
   ```

4. **Create `requirements.txt`:**
   ```bash
   pip freeze > requirements.txt
   ```

5. **Run Flask backend:**
   ```bash
   python app.py
   ```
   Backend runs on `http://127.0.0.1:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Required dependencies:**
   ```bash
   npm install react-router-dom axios chart.js react-chartjs-2
   ```

4. **Start development server:**
   ```bash
   npm start
   ```
   Frontend runs on `http://localhost:3000`

## 📚 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get user profile (requires X-User-ID header)

### Document Processing
- `POST /upload` - Upload and process ESG report (requires X-User-ID header)
  - Form data: file, company_name, year
  - Returns: ESG score, extracted data, explanation anomaly detection

### Analysis
- `GET /analysis` - Get detailed SHAP analysis (requires report_id, X-User-ID header)
- `GET /reports` - Get all user reports (requires X-User-ID header)
- `GET /company-scores` - Get historical scores for company (requires company_name, X-User-ID header)
- `GET /blockchain-history` - Get blockchain records (requires company_name, X-User-ID header)
- `GET /anomalies` - Get detected anomalies (requires X-User-ID header)

### Chatbot
- `POST /chat` - Ask ESG assistant (requires X-User-ID header)
  - Body: { "query": "your question" }
  - Returns: { "response": "answer" }
- `GET /chat-history` - Get chat history (optional limit parameter, requires X-User-ID header)

### Visualization
- `POST /shap` - Generate SHAP visualization
  - Body: { "explanation": {...} }
  - Returns: Base64-encoded PNG image

## 🔐 Authentication

All protected endpoints require the `X-User-ID` header with the authenticated user's ID:
```
Headers: {
  "X-User-ID": "user_id",
  "Content-Type": "application/json"
}
```

## 📊 ESG Scoring Formula

The platform calculates ESG scores using:

```
ESG Score = (Scope_Emissions × 0.40) + 
            (Renewable_Energy × 0.30) + 
            (Carbon_Neutrality × 0.15) + 
            (Water_Management × 0.10) + 
            (Waste_Management × 0.05)

Final Score: 0-100 (100 is best)

Risk Levels:
- 80-100: Low Risk (🟢 Green)
- 60-79:  Medium Risk (🟡 Yellow)
- 40-59:  High Risk (🟠 Orange)
- 0-39:   Critical Risk (🔴 Red)
```

## ⛓️ Blockchain Implementation

- Cryptographic hashing of ESG records
- Full chain verification capability
- Immutable historical records
- Hash linking between years

```python
# Example hash generation
Block = {
  "company": "Company Name",
  "year": 2024,
  "score": 75.5,
  "hash": "sha256_hash",
  "previous_hash": "previous_sha256_hash",
  "timestamp": "ISO_datetime"
}
```

## 🤖 Chatbot (RAG System)

Uses FAISS + Sentence Transformers for intelligent Q&A:
- Retrieves relevant context from uploaded documents
- Answers ESG-related questions
- Maintains chat history per user
- Powered by semantic search

## 📊 Sample Data Structure

### User
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "created_at": "2024-03-20T10:00:00"
}
```

### ESG Score Record
```json
{
  "id": 1,
  "report_id": 1,
  "user_id": 1,
  "scope1": 300,
  "scope2": 500,
  "scope3": 1500,
  "renewable_energy": 0.65,
  "carbon_neutral": 1,
  "esg_score": 78.5,
  "calculated_at": "2024-03-20T10:05:00"
}
```

## 🛠️ Development Tips

### Adding New Features

1. **Backend**: Add endpoints in `app.py`, database functions in `database.py`
2. **Frontend**: Create React components in `src/pages/` or `src/components/`
3. **API Integration**: Use axios with X-User-ID header
4. **Testing**: Use Postman or curl for API testing

### Common Issues

**CORS Errors:**
- Backend already configured with Flask-CORS
- Check frontend URL matches backend CORS settings

**Database Issues:**
- Database auto-initializes on first run
- Located at `backend/esg_platform.db`
- Clear database: Delete `esg_platform.db` and restart backend

**Document Parsing:**
- Ensure pdfs are text-based (not scanned images)
- DOCX extraction works with tables and paragraphs
- TXT files must be UTF-8 encoded

## 🚢 Deployment

### Production Checklist

- [ ] Change Flask `debug=False`
- [ ] Use environment variables for sensitive config
- [ ] Set up proper database (PostgreSQL instead of SQLite)
- [ ] Configure email service for notifications
- [ ] Set up SSL/HTTPS
- [ ] Enable rate limiting
- [ ] Configure backup strategy for blockchain records
- [ ] Add logging and monitoring
- [ ] Set up CI/CD pipeline

### Deployment Options

**Option 1: Heroku**
```bash
# Create Procfile
echo "web: gunicorn app:app" > Procfile

# Deploy
heroku create your-app-name
git push heroku main
```

**Option 2: AWS EC2**
```bash
# Install dependencies
sudo apt-get install python3 npm
pip install gunicorn

# Run backend with gunicorn
gunicorn -w 4 app:app

# Use Nginx as reverse proxy
```

**Option 3: Docker**
```dockerfile
# Dockerfile backend
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "-w", "4", "app:app"]
```

## 📝 Environment Variables

Create `.env` file (backend):
```
FLASK_ENV=production
DATABASE_URL=sqlite:///esg_platform.db
SECRET_KEY=your-secret-key
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see LICENSE.md for details.

## 🙋 Support

For issues and questions:
1. Check existing issues on GitHub
2. Create detailed bug reports
3. Include error logs and steps to reproduce

## 🎯 Roadmap

- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Advanced ML models for predictions
- [ ] Real blockchain integration (Ethereum)
- [ ] API rate limiting and analytics
- [ ] Email notifications
- [ ] Schedule periodic audits
- [ ] Export reports to PDF
- [ ] Integration with ESG databases
- [ ] Comparison benchmarking

## 🔗 External Resources

- [ESG Standards](https://www.sasb.org/)
- [Carbon Accounting](https://www.ghgprotocol.org/)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [React Documentation](https://react.dev/)
- [Chart.js Documentation](https://www.chartjs.org/)

---

**Built with ❤️ for sustainable businesses**
