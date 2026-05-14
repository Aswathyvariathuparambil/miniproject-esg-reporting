# ⚡ Quick Start Guide - ESG Platform

## 🎯 Get Running in 5 Minutes

### Step 1: Start Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

✅ Backend ready at: `http://127.0.0.1:5000`

### Step 2: Start Frontend (New Terminal)

```bash
cd frontend
npm install
npm start
```

✅ Frontend ready at: `http://localhost:3000`

## 📝 First Time Using Platform

### 1. Create Account
- Click "Sign Up" on home page
- Enter username, email, password
- Click "Create Account" → Redirects to Login

### 2. Login
- Enter credentials
- Click "Sign In"
- Redirected to home page (now logged in!)

### 3. Upload Report
- Click "Upload" in sidebar
- Enter company name (e.g., "Tesla")
- Select report year (2023-2025)
- Upload PDF/DOCX/TXT file
- Click "Upload & Analyze"
- View ESG score and breakdown!

### 4. View Dashboard
- Click "Dashboard" in sidebar
- See charts and metrics
- Check risk level and trends
- View recommendations

### 5. Deep Analysis
- Click "Analysis" in sidebar
- See SHAP explainability
- Understand what drives your score
- Review strategic recommendations

### 6. Chat with Bot
- Click chatbot bubble (bottom-right)
- Ask "What does ESG score mean?"
- Get instant answers based on your data

### 7. View Profile
- Click "Profile" in sidebar
- See all uploaded reports
- View chat conversation history

## 🔧 Test with Sample Data

### Sample CSV to Extract (copy to text file and upload as .txt):

```
Company: Tesla Inc
Report Year: 2024
Scope 1 Emissions: 250.5 tCO2e
Scope 2 Emissions: 450.75 tCO2e
Scope 3 Emissions: 1200 tCO2e
Renewable Energy: 85.5 percent
Carbon Neutral Commitment: Yes
Water Usage: 500000 gallons
Waste Recycled: 95 percent
```

Upload this → Get ESG score automatically!

## 🐛 Troubleshooting

### Backend won't start?
```bash
# Check Python version (need 3.8+)
python --version

# Kill old process on port 5000
# Windows: netstat -ano | findstr :5000
# Mac/Linux: lsof -i :5000
```

### Frontend won't start?
```bash
# Clear npm cache
npm cache clean --force
rm -rf node_modules
npm install
npm start
```

### No data connecting?
- Check backend console for errors
- Verify headers: `X-User-ID` should be user ID
- Check network tab in browser DevTools
- Ensure CORS is enabled in Flask

### Database issue?
```bash
# Reset database (clears all data!)
rm esg_platform.db
# Restart backend - recreates from scratch
```

## 📊 API Testing with CURL

### Register User
```bash
curl -X POST http://127.0.0.1:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

### Login
```bash
curl -X POST http://127.0.0.1:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

### Get Profile
```bash
curl -X GET http://127.0.0.1:5000/auth/profile \
  -H "X-User-ID: 1"
```

### Chat with Bot
```bash
curl -X POST http://127.0.0.1:5000/chat \
  -H "Content-Type: application/json" \
  -H "X-User-ID: 1" \
  -d '{"query":"What does a good ESG score mean?"}'
```

## 🎨 Customize Platform

### Change Theme Colors
Edit CSS files in `frontend/src/styles/`:
- Update gradient colors in `Home.css`
- Modify button colors in `Upload.css`
- Change dashboard theme in `Dashboard.css`

### Modify Scoring Formula
Edit `backend/model.py` `predict()` function:
```python
# Example: Change weight to 50% emissions, 30% renewable
score = (
    scope_score * 0.50 +
    renewable * 0.30 + ...
)
```

### Add New Chart
In `frontend/src/pages/DashboardPage.js`:
```javascript
const ctx = useRef(null);
new Chart(ctx.current, {
  type: 'radar',  // New chart type
  data: { ... }
});
```

## 📚 Key Files to Know

| File | Purpose | Edit For |
|------|---------|----------|
| `backend/app.py` | All API endpoints | Adding new features |
| `backend/model.py` | ESG scoring formula | Changing calculation |
| `backend/database.py` | Database schema | Adding data fields |
| `frontend/src/App.js` | Route configuration | Changing navigation |
| `frontend/index.css` | Global styles | Site-wide colors |

## ✨ Next Steps

1. **Deploy to Cloud**: Use Heroku, AWS, or Azure
2. **Add Database**: Switch from SQLite to PostgreSQL
3. **Email Notifications**: Send reports via email
4. **Mobile App**: Build React Native version
5. **Real Blockchain**: Integrate Ethereum

## 🆘 Need Help?

Check error messages:
1. Backend console (terminal running Flask)
2. Browser DevTools (F12) → Network tab
3. Browser DevTools → Console tab for JS errors

Look for:
- 404 errors = endpoint not found
- 500 errors = backend crash
- CORS errors = frontend-backend communication issue
- Blank pages = React component error

---

**Ready to go! Start with `python app.py` and `npm start`** 🚀
