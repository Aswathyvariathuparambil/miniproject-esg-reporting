# 🆘 Troubleshooting & FAQ Guide

Complete troubleshooting guide and frequently asked questions for the ESG Platform.

---

## 🚨 Critical Issues & Solutions

### Issue: Backend Won't Start

**Symptoms:**
```
ModuleNotFoundError: No module named 'flask'
Port 5000 already in use
```

**Solutions:**

```bash
# Solution 1: Install missing dependencies
pip install -r requirements.txt
pip install flask flask-cors werkzeug pdfplumber python-docx

# Solution 2: Kill process on port 5000
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>

# Solution 3: Check Python version
python --version  # Must be 3.8+

# Solution 4: Check virtual environment
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate  # Windows
```

---

### Issue: Frontend Won't Build

**Symptoms:**
```
npm ERR!
Module not found
EACCES permission denied
```

**Solutions:**

```bash
# Solution 1: Clear npm cache
npm cache clean --force

# Solution 2: Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Solution 3: Update npm
npm install -g npm@latest

# Solution 4: Check Node version (need 14+)
node --version
npm --version

# Solution 5: Fix permissions (macOS/Linux)
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

---

### Issue: Database Errors

**Symptoms:**
```
database is locked
no such table: users
schema mismatch
```

**Solutions:**

```bash
# Solution 1: Reset database
rm backend/esg_platform.db
# Restart Flask - recreates automatically

# Solution 2: Check file permissions
chmod 755 backend/esg_platform.db

# Solution 3: Verify database exists
ls -la backend/esg_platform.db

# Solution 4: Reinitialize in Python
cd backend
python
>>> from database import init_db
>>> init_db()
>>> exit()
```

---

### Issue: CORS Errors in Browser Console

**Symptoms:**
```
Access to XMLHttpRequest blocked by CORS policy
No 'Access-Control-Allow-Origin' header
```

**Solutions:**

**In Backend (app.py):**
```python
# Ensure CORS is configured
from flask_cors import CORS
app = Flask(__name__)
CORS(app)  # This should be near the top

# Or specific configuration:
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000", "http://127.0.0.1:3000"]
    }
})
```

**In Frontend (axios calls):**
```javascript
// Add headers properly
const res = await axios.get('http://127.0.0.1:5000/auth/profile', {
  headers: {
    'X-User-ID': userId,
    'Content-Type': 'application/json'
  }
});
```

---

### Issue: File Upload Not Working

**Symptoms:**
```
File upload stuck at "Uploading..."
413 Request Entity Too Large
File not saved in uploads folder
```

**Solutions:**

```python
# Solution 1: Check file size in app.py
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB

# Solution 2: Verify uploads folder exists
import os
os.makedirs('uploads', exist_ok=True)

# Solution 3: Check file permissions
chmod 755 backend/uploads

# Solution 4: Verify file types in Frontend
const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];

if (!ALLOWED_TYPES.includes(file.type)) {
    setError('Invalid file type');
}
```

---

### Issue: Chat/Chatbot Not Responding

**Symptoms:**
```
Chatbot shows "Error connecting to server"
No response from /chat endpoint
FAISS not working
```

**Solutions:**

```python
# Solution 1: Check RAG dependencies
pip install sentence-transformers faiss-cpu

# Solution 2: Verify endpoint
@app.route('/chat', methods=['POST'])
def chat():
    user_query = request.json.get('query')
    if not user_query:
        return jsonify({"error": "No query provided"}), 400
    # ... rest of logic

# Solution 3: Check FAISS index initialization
from rag import RAGSystem
rag = RAGSystem()
if rag.index is None:
    rag.build_index()
```

---

### Issue: Authentication Fails

**Symptoms:**
```
401 Unauthorized
X-User-ID header missing
Login loop - keeps redirecting to login
```

**Solutions:**

**Backend Check:**
```python
# Ensure login_required decorator is working
@app.before_request
def check_auth():
    if request.endpoint not in ['auth.register', 'auth.login']:
        user_id = request.headers.get('X-User-ID')
        if not user_id:
            return jsonify({"error": "Unauthorized"}), 401
```

**Frontend Check:**
```javascript
// Ensure userId is set after login
const handleLogin = async (credentials) => {
  const res = await axios.post('http://127.0.0.1:5000/auth/login', credentials);
  localStorage.setItem('userId', res.data.user_id);
  localStorage.setItem('username', res.data.username);
  navigate('/');  // Redirect to home
};
```

---

## ❓ Frequently Asked Questions

### Q1: How do I run both backend and frontend?

**A:** Use two terminal windows:

```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python app.py

# Terminal 2 - Frontend
cd frontend
npm start
```

Both will run simultaneously. Backend on port 5000, frontend on port 3000.

---

### Q2: What file formats are supported for document upload?

**A:** Currently supported:
- **PDF** (.pdf) - Text-based PDFs only, not scanned images
- **Word** (.docx, .doc) - Requires python-docx library
- **Text** (.txt) - UTF-8 encoded text files

The system will reject other formats with an error message.

---

### Q3: How is the ESG score calculated?

**A:** The score uses a weighted formula with 5 components:

```
ESG Score = (Scope_Emissions × 40%) +
            (Renewable_Energy × 30%) +
            (Carbon_Neutrality × 15%) +
            (Water_Management × 10%) +
            (Waste_Management × 5%)

Final Score: 0-100 (higher is better)

Risk Levels:
- 80-100: Low Risk 🟢
- 60-79: Medium Risk 🟡
- 40-59: High Risk 🟠
- 0-39: Critical Risk 🔴
```

You can modify the weights in `backend/model.py`.

---

### Q4: How long do uploads take?

**A:** Processing time depends on:
- File size: 1-5MB files typically process in 2-5 seconds
- File complexity: PDFs with tables take longer than plain text
- System resources: More CPU/RAM = faster processing

Typical timeline:
- Upload: <1 second
- Parsing: 1-3 seconds
- ESG Calculation: <1 second
- Blockchain Storage: <1 second
- **Total: 2-5 seconds**

---

### Q5: Can I reset my password?

**A:** Currently **not implemented** in v1.0. To reset:

1. **Ask database admin** to update your password hash directly
2. **Or recreate your account**:
   - Delete user record from database
   - Register new account with same email
3. **Or use database admin tools** like SQLite Browser

Coming in **v1.1 Q2 2024**.

---

### Q6: How long is chat history kept?

**A:** Chat history is stored permanently in the database until:
- User manually clears it (button in profile page)
- Database is reset
- Records are deleted by admin

You can view all previous conversations in your Profile page.

---

### Q7: Can I export my reports?

**A:** Currently **not implemented** in v1.0. To get your data:

1. **View in Dashboard**: Take screenshots of charts
2. **Access Database**: Use SQLite Browser to export
3. **API Export**: Use cURL to pull JSON data:

```bash
curl http://127.0.0.1:5000/reports \
  -H "X-User-ID: 1" \
  -H "Content-Type: application/json" > reports.json
```

Coming in **v1.1 Q2 2024** with CSV/PDF export.

---

### Q8: How does the blockchain work?

**A:** This isn't a real blockchain network (like Bitcoin), but a chain of cryptographically-linked records:

```
Block Format:
{
  "company": "Tesla Inc",
  "year": 2024,
  "score": 78.5,
  "hash": "sha256_hash_of_this_block",
  "previous_hash": "hash_of_previous_year",
  "timestamp": "2024-03-20T10:00:00Z"
}

Each hash includes data + previous_hash, making tampering detectable.
```

See analytics page's "Verify Blockchain" button to check integrity.

---

### Q9: What does "Anomaly Detected" mean?

**A:** An anomaly is when your ESG score changes significantly year-over-year:

```
Change % = |New Score - Previous Score| / Previous Score × 100

Severity Thresholds:
- >50% change: Critical Anomaly 🔴
- 30-50% change: High Anomaly 🟠
- 15-30% change: Medium Anomaly 🟡
- <15% change: Normal
```

Anomalies suggest major improvements, declines, or calculation differences.

---

### Q10: How many users can the platform support?

**A:** Depends on infrastructure:

| Scale | SQLite | Users/Sec | Note |
|-------|--------|-----------|------|
| Development | ✅ | 1-10 | Single-user friendly |
| Small team | ⚠️ | 10-100 | SQLite starts struggling |
| Enterprise | ❌ | 100+ | Need PostgreSQL |

**For production with many users:**
- Switch to **PostgreSQL** database
- Use **Gunicorn** with multiple workers
- Add **Redis** caching
- Scale to **multiple servers**

---

### Q11: How do I delete my account?

**A:** Currently **not implemented**. To delete account:

1. **Contact database admin**
2. **Manual deletion**: Delete from `users` table in database
3. **Data export**: First export your reports if needed

Coming in **v1.1**.

---

### Q12: Is data encryption available?

**A:** Currently **limited encryption**:
- ✅ Password hashing with werkzeug
- ✅ Blockchain record hashing
- ❌ Data-at-rest encryption
- ❌ Transmission encryption (no HTTPS in dev)

Coming in production deployment with SSL/HTTPS.

---

### Q13: Can I use this commercially?

**A:** Yes, but check licensing:
- **Code License**: MIT (free for commercial use)
- **Dependencies**: Check each library's license
- **Data Privacy**: Ensure GDPR compliance if serving EU users

---

### Q14: How do I contribute to development?

**A:** Follow git workflow:

```bash
# 1. Fork repository
# 2. Create feature branch
git checkout -b feature/my-feature

# 3. Make changes
# 4. Commit
git commit -m "Add my feature"

# 5. Push and create PR
git push origin feature/my-feature
```

See DEVELOPER_SETUP.md for full details.

---

### Q15: What's your support policy?

**A:** Current support channels:
- **GitHub Issues**: Bug reports and feature requests
- **Documentation**: Check README, API_DOCUMENTATION, DEVELOPER_SETUP
- **Email**: Support email (to be configured)

Response time: 24-48 hours for reported issues.

---

## 🔧 Performance Optimization Tips

### Backend Optimization

```python
# 1. Add caching
from flask_caching import Cache
cache = Cache(app, config={'CACHE_TYPE': 'simple'})

# 2. Optimize queries
# Bad:
for user in all_users:
    get_user_scores(user.id)

# Good:
all_scores = db.query(ESGScore).filter_by(active=True).all()

# 3. Use connection pooling
from sqlalchemy.pool import QueuePool

# 4. Lazy load relationships
report = db.query(Report).options(
    joinedload(Report.scores)
).first()
```

### Frontend Optimization

```javascript
// 1. Code splitting
const Dashboard = lazy(() => import('./pages/DashboardPage'));

// 2. Memoization
const MemoChart = memo(function Chart(props) {
  // Component only rerenders if props change
});

// 3. Image optimization
<img loading="lazy" src="chart.png" alt="Chart" />

// 4. Debounce expensive operations
const debouncedSearch = debounce(handleSearch, 300);
```

---

## ✅ Verification Checklist

Before reporting issues, verify:

- [ ] Backend is running: `curl http://127.0.0.1:5000/health`
- [ ] Frontend is running: `curl http://localhost:3000`
- [ ] Python version >= 3.8: `python --version`
- [ ] Node version >= 14: `node --version`
- [ ] All dependencies installed: `pip list` and `npm list`
- [ ] Database file exists: `ls backend/esg_platform.db`
- [ ] No port conflicts: `lsof -i :5000` and `lsof -i :3000`
- [ ] Virtual environment activated
- [ ] CORS enabled in Flask
- [ ] X-User-ID header present in API calls

---

## 📞 Escalation Process

**For unresolved issues:**

1. **Gather information**:
   - Error message (full text)
   - Steps to reproduce
   - System info (OS, Python version, Node version)
   - Screenshots/logs

2. **Document in issue template**:
   ```markdown
   **Bug Description**: [Clear, concise description]
   **Steps to Reproduce**: [1. 2. 3...]
   **Expected Behavior**: [What should happen]
   **Actual Behavior**: [What does happen]
   **Environment**: [OS, versions]
   **Logs**: [Copy-paste error messages]
   ```

3. **Submit via GitHub Issues**

4. **Escalate to email** if urgent

---

## 🎓 Learning Resources

### For Debugging
- [Flask Debugging Guide](https://flask.palletsprojects.com/en/2.3.x/debugging/)
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [MDN JavaScript Debugging](https://developer.mozilla.org/en-US/docs/Tools/Debugger)

### For Troubleshooting
- [Stack Overflow](https://stackoverflow.com/)
- [Debugging Python](https://docs.python.org/3/library/pdb.html)
- [Node.js Debugging](https://nodejs.org/en/docs/guides/debugging-getting-started/)

---

**Last Updated:** March 20, 2024  
**Version:** 1.0 Support Documentation

Still having issues? Check the other documentation files:
- **QUICK_START.md** - Get running quickly
- **DEVELOPER_SETUP.md** - Development environment
- **API_DOCUMENTATION.md** - API reference
- **README.md** - Full overview
