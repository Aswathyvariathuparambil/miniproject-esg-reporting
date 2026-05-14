# 📚 ESG Platform API Reference

Complete API documentation for the ESG Carbon Footprint Auditing Platform.

**Base URL:** `http://127.0.0.1:5000`

---

## Authentication Endpoints

### 1️⃣ Register New User

**Endpoint:** `POST /auth/register`

**Description:** Create a new user account

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "user_id": 1,
  "username": "john_doe"
}
```

**Error Response (400):**
```json
{
  "error": "Username already exists"
}
```

---

### 2️⃣ User Login

**Endpoint:** `POST /auth/login`

**Description:** Authenticate user and receive user ID

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "securepassword123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "user_id": 1,
  "username": "john_doe",
  "email": "john@example.com"
}
```

**Error Response (401):**
```json
{
  "error": "Invalid username or password"
}
```

---

### 3️⃣ Get User Profile

**Endpoint:** `GET /auth/profile`

**Description:** Retrieve authenticated user profile information

**Headers:**
```
X-User-ID: 1
```

**Response (200 OK):**
```json
{
  "user_id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "created_at": "2024-03-20T10:00:00Z"
}
```

---

## Document Upload & Processing

### 4️⃣ Upload ESG Report

**Endpoint:** `POST /upload`

**Description:** Upload and analyze ESG/carbon report document

**Headers:**
```
Content-Type: multipart/form-data
X-User-ID: 1
```

**Form Data:**
```
file: <file object> (PDF, DOCX, TXT)
company_name: "Tesla Inc"
year: 2024
```

**Response (200 OK):**
```json
{
  "message": "File uploaded and analyzed successfully",
  "report_id": 5,
  "company": "Tesla Inc",
  "year": 2024,
  "file_name": "esg_report_2024.pdf",
  "esg_score": 78.5,
  "scope1_emissions": 300.5,
  "scope2_emissions": 450.75,
  "scope3_emissions": 1200.25,
  "renewable_energy": 0.855,
  "carbon_neutral_commitment": 1,
  "extracted_data": {
    "company": "Tesla Inc",
    "year": 2024,
    "scope_1": 300.5,
    "scope_2": 450.75,
    "scope_3": 1200.25,
    "renewable_energy_pct": 85.5,
    "carbon_neutral": "Yes",
    "employee_count": 127855
  },
  "explanation": {
    "scope_emissions": 65.4,
    "renewable_energy": 25.65,
    "carbon_neutrality": 15.0,
    "water_management": 8.5,
    "waste_management": 7.85
  },
  "risk_level": "Low Risk",
  "anomaly_detected": false,
  "anomaly_details": null
}
```

**Error Response (400):**
```json
{
  "error": "No file provided"
}
```

**Supported File Types:**
- PDF (.pdf)
- Word (.docx, .doc)
- Text (.txt)

---

## Analysis Endpoints

### 5️⃣ Get SHAP Analysis

**Endpoint:** `GET /analysis`

**Description:** Get detailed SHAP explainability analysis for a report

**Query Parameters:**
```
report_id=5 (required)
```

**Headers:**
```
X-User-ID: 1
```

**Response (200 OK):**
```json
{
  "report_id": 5,
  "company": "Tesla Inc",
  "year": 2024,
  "esg_score": 78.5,
  "risk_level": "Low Risk",
  "shap_values": {
    "scope_emissions": {
      "value": 65.4,
      "percentage": 41.8,
      "description": "Lower scope emissions than industry average"
    },
    "renewable_energy": {
      "value": 25.65,
      "percentage": 32.6,
      "description": "Above average renewable energy adoption"
    },
    "carbon_neutrality": {
      "value": 15.0,
      "percentage": 19.1,
      "description": "Committed to carbon neutrality by 2030"
    },
    "water_management": {
      "value": 8.5,
      "percentage": 10.8,
      "description": "Good water usage management"
    },
    "waste_management": {
      "value": 7.85,
      "percentage": 10.0,
      "description": "95% waste recycling rate"
    }
  },
  "recommendations": [
    {
      "priority": "Critical",
      "action": "Increase solar energy capacity by 15%",
      "impact": "Could improve renewable energy score from 85.5% to 95%"
    },
    {
      "priority": "High",
      "action": "Implement carbon offset programs",
      "impact": "Would achieve carbon neutral operations"
    }
  ]
}
```

---

### 6️⃣ Get All User Reports

**Endpoint:** `GET /reports`

**Description:** List all uploaded reports for authenticated user

**Headers:**
```
X-User-ID: 1
```

**Response (200 OK):**
```json
{
  "reports": [
    {
      "report_id": 1,
      "company": "Tesla Inc",
      "year": 2023,
      "file_name": "tesla_2023_report.pdf",
      "esg_score": 75.2,
      "upload_date": "2024-01-15T10:00:00Z"
    },
    {
      "report_id": 5,
      "company": "Tesla Inc",
      "year": 2024,
      "file_name": "tesla_2024_report.pdf",
      "esg_score": 78.5,
      "upload_date": "2024-03-20T14:30:00Z"
    }
  ],
  "total_reports": 2
}
```

---

### 7️⃣ Get Company Historical Scores

**Endpoint:** `GET /company-scores`

**Description:** Get all ESG scores for a specific company

**Query Parameters:**
```
company_name=Tesla (required)
```

**Headers:**
```
X-User-ID: 1
```

**Response (200 OK):**
```json
{
  "company": "Tesla",
  "scores": [
    {
      "year": 2022,
      "score": 72.1,
      "risk_level": "Medium Risk"
    },
    {
      "year": 2023,
      "score": 75.2,
      "risk_level": "Low Risk"
    },
    {
      "year": 2024,
      "score": 78.5,
      "risk_level": "Low Risk"
    }
  ],
  "trend": "Improving"
}
```

---

### 8️⃣ Get Blockchain History

**Endpoint:** `GET /blockchain-history`

**Description:** Retrieve immutable blockchain records for company

**Query Parameters:**
```
company_name=Tesla (required)
```

**Headers:**
```
X-User-ID: 1
```

**Response (200 OK):**
```json
{
  "company": "Tesla",
  "blockchain_records": [
    {
      "year": 2024,
      "score": 78.5,
      "hash": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
      "previous_hash": "z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4",
      "timestamp": "2024-03-20T14:35:22Z"
    }
  ],
  "chain_verified": true
}
```

---

### 9️⃣ Get Anomalies

**Endpoint:** `GET /anomalies`

**Description:** Detect and retrieve anomalies in company's ESG scores

**Headers:**
```
X-User-ID: 1
```

**Query Parameters (Optional):**
```
company_name=Tesla (optional - if empty, gets all user's anomalies)
```

**Response (200 OK):**
```json
{
  "anomalies": [
    {
      "anomaly_id": 3,
      "company": "Tesla",
      "year": 2024,
      "score": 78.5,
      "previous_score": 75.2,
      "change_percentage": 4.39,
      "severity": "Medium",
      "description": "Score increased by 4.39% from 2023"
    }
  ],
  "total_anomalies": 1
}
```

---

## Chatbot Endpoints

### 🔟 Chat with AI Assistant

**Endpoint:** `POST /chat`

**Description:** Ask ESG-related questions to AI chatbot

**Headers:**
```
Content-Type: application/json
X-User-ID: 1
```

**Request Body:**
```json
{
  "query": "What does a good ESG score mean?"
}
```

**Response (200 OK):**
```json
{
  "query": "What does a good ESG score mean?",
  "response": "A good ESG score (typically 70-100) indicates strong environmental, social, and governance practices. It demonstrates commitment to sustainability, reduced carbon emissions, renewable energy use, and proper waste management. Companies with high ESG scores typically have lower operational risks and better long-term resilience.",
  "sources": ["uploaded_report_1.pdf", "uploaded_report_2.pdf"],
  "confidence": 0.92
}
```

---

### 1️⃣1️⃣ Get Chat History

**Endpoint:** `GET /chat-history`

**Description:** Retrieve all previous conversations with chatbot

**Headers:**
```
X-User-ID: 1
```

**Query Parameters (Optional):**
```
limit=50 (default: all messages)
```

**Response (200 OK):**
```json
{
  "chat_history": [
    {
      "message_id": 1,
      "user_message": "What is Scope 1 emissions?",
      "bot_response": "Scope 1 emissions are direct greenhouse gas emissions...",
      "timestamp": "2024-03-20T10:15:00Z"
    },
    {
      "message_id": 2,
      "user_message": "How can we reduce our carbon footprint?",
      "bot_response": "Here are key strategies to reduce carbon footprint...",
      "timestamp": "2024-03-20T10:20:00Z"
    }
  ],
  "total_messages": 2
}
```

---

## Error Handling

### Standard Error Response Format
```json
{
  "error": "Descriptive error message",
  "status": 400,
  "timestamp": "2024-03-20T10:00:00Z"
}
```

### Common Error Codes

| Code | Message | Cause |
|------|---------|-------|
| 400 | Bad Request | Invalid parameters |
| 401 | Unauthorized | Missing/invalid X-User-ID header |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate username/email |
| 500 | Server Error | Backend error |

---

## Rate Limiting

- No rate limiting on local deployment
- Production: 100 requests/minute per user recommended

---

## Authentication Example (Node.js/JavaScript)

```javascript
const axios = require('axios');

const config = {
  headers: {
    'X-User-ID': '1',
    'Content-Type': 'application/json'
  }
};

// Get profile
axios.get('http://127.0.0.1:5000/auth/profile', config)
  .then(res => console.log(res.data))
  .catch(err => console.error(err));
```

---

## Testing Endpoints

### Using cURL

```bash
# Register
curl -X POST http://127.0.0.1:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"pass123"}'

# Login
curl -X POST http://127.0.0.1:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"pass123"}'

# Get Profile
curl -X GET http://127.0.0.1:5000/auth/profile \
  -H "X-User-ID: 1"

# Upload File
curl -X POST http://127.0.0.1:5000/upload \
  -H "X-User-ID: 1" \
  -F "file=@report.pdf" \
  -F "company_name=Tesla" \
  -F "year=2024"
```

### Using Postman

1. Create new request
2. Set method to POST/GET
3. Enter endpoint URL
4. Add header: `X-User-ID` = `1`
5. For POST requests, add JSON body
6. Click Send

---

## Pagination

Future versions will support pagination:

```
GET /reports?page=1&limit=10
GET /chat-history?page=2&limit=25
```

---

## Webhooks

Future feature: Send notifications on report analysis completion

---

## SDK & Client Libraries

Currently recommended:
- **JavaScript**: Axios, Fetch API
- **Python**: requests library
- **Postman**: Direct API testing

---

**Last Updated:** March 20, 2024  
**API Version:** 1.0
