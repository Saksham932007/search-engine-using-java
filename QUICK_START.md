# Java Search Engine - Quick Start Guide

## 🚀 Your search engine is now running!

### Service URLs
- **Frontend (React)**: http://localhost:3000
- **Backend API (Spring Boot)**: http://localhost:8080
- **H2 Database Console**: http://localhost:8080/h2-console

### Default Credentials
- **Database**: 
  - JDBC URL: `jdbc:h2:mem:searchengine`
  - Username: `sa`
  - Password: (empty)
- **Spring Security** (if required): Check backend logs for generated password

### Quick Actions

#### 1. Open the Web Interface
```bash
# Open in browser
open http://localhost:3000
```

#### 2. Test Backend API
```bash
# Health check
curl http://localhost:8080/actuator/health

# Test search (might require authentication)
curl -X POST http://localhost:8080/api/search \
  -H "Content-Type: application/json" \
  -d '{"query":"test","searchType":"content","page":0,"size":10}'
```

#### 3. Upload a Document
Using the web interface at http://localhost:3000:
1. Click "Upload Document" 
2. Select a file (PDF, Word, TXT, etc.)
3. Add title and tags
4. Click "Upload"

#### 4. Search Documents
1. Enter your search query in the search box
2. Select search type (content, title, or tags)
3. Click "Search"

### Project Structure
```
search engine/
├── backend/          # Spring Boot Java backend
├── frontend/         # React frontend
├── database/         # SQL initialization
├── sample-documents/ # Sample files for testing
└── docs/            # API documentation
```

### Available Features
✅ Document upload (multiple formats)
✅ Full-text search with Lucene
✅ Metadata management
✅ Document versioning
✅ Advanced search filters
✅ User management
✅ Admin dashboard
✅ RESTful API

### Stopping the Services
```bash
# Stop frontend (if running in foreground)
Ctrl+C

# Stop backend
ps aux | grep java
kill <java-process-id>
```

### Logs
- Backend logs: Check `backend/backend.log` or terminal output
- Frontend logs: Check browser console or terminal output

### Next Steps
1. **Upload sample documents** from the `sample-documents/` folder
2. **Test search functionality** with different query types
3. **Explore the API** at http://localhost:8080/docs/API.md
4. **Customize settings** in `backend/src/main/resources/application.properties`

### Troubleshooting
- If port 3000 is busy: The frontend will auto-assign another port
- If port 8080 is busy: Update `server.port` in application.properties
- For CORS issues: Check CORS configuration in backend SecurityConfig

🎉 **Your Java-based search engine is ready to use!**