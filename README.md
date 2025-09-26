# Java Search Engine

A comprehensive full-stack search engine built with Java Spring Boot backend and React frontend, powered by Apache Lucene for high-performance full-text search capabilities.

## 🚀 Features

### Core Features
- **Full-Text Search**: Advanced search with highlighting, ranking, and relevance scoring
- **Document Indexing**: Support for multiple document formats (PDF, DOC, TXT, HTML, etc.)
- **Real-time Indexing**: Documents are indexed immediately upon upload
- **Search Analytics**: Track search queries, performance metrics, and user behavior
- **RESTful API**: Complete REST API for all search and document management operations
- **Responsive Web Interface**: Modern, mobile-friendly React frontend

### Advanced Features
- **Multi-format Support**: Index documents in various formats using Apache Tika
- **Search Suggestions**: Auto-complete and query suggestions
- **Result Highlighting**: Highlight search terms in results
- **Pagination**: Efficient pagination for large result sets
- **Search History**: Track and analyze search patterns
- **Admin Dashboard**: Comprehensive admin interface for document and search management
- **Bulk Operations**: Index entire directories and perform batch operations

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Frontend │    │  Spring Boot     │    │   Apache Lucene │
│   (Port 3000)    │◄──►│  Backend API     │◄──►│   Search Index  │
│                 │    │  (Port 8080)     │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │  PostgreSQL/H2   │
                       │    Database      │
                       └──────────────────┘
```

### Technology Stack

#### Backend
- **Java 17**: Modern Java features and performance
- **Spring Boot 3.2**: Rapid application development
- **Spring Data JPA**: Database abstraction layer
- **Apache Lucene 9.8**: High-performance search engine
- **Apache Tika 2.9**: Document content extraction
- **PostgreSQL**: Production database
- **H2 Database**: Development database
- **Maven**: Dependency management

#### Frontend
- **React 18**: Modern JavaScript framework
- **React Bootstrap**: UI components
- **Axios**: HTTP client
- **React Router**: Client-side routing
- **Moment.js**: Date handling

#### DevOps & Deployment
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration
- **Nginx**: Frontend web server
- **Maven**: Build automation

## 🚀 Quick Start

### Prerequisites
- Java 17 or higher
- Node.js 18 or higher
- Docker and Docker Compose (for containerized deployment)

### Option 1: Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd search-engine
   ```

2. **Start the application**
   ```bash
   # Production environment with PostgreSQL
   docker-compose up -d
   
   # Development environment with H2 database
   docker-compose -f docker-compose.dev.yml up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080/api
   - Database Console: http://localhost:8080/h2-console (dev mode)

### Option 2: Manual Setup

#### Backend Setup
```bash
cd backend
./mvnw clean install
./mvnw spring-boot:run
```

#### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## 📚 API Documentation

### Search Endpoints

#### Search Documents
```http
GET /api/search?q={query}&page={page}&size={size}
```

**Parameters:**
- `q` (required): Search query string
- `page` (optional): Page number (default: 0)
- `size` (optional): Page size (default: 10, max: 100)

**Response:**
```json
{
  "query": "java programming",
  "results": [
    {
      "id": 1,
      "title": "Introduction to Java",
      "content": "Java is a programming language...",
      "url": "https://example.com/java-intro",
      "highlightedContent": "Java is a <mark>programming</mark> language...",
      "score": 1.2345,
      "createdAt": "2023-01-01T10:00:00Z"
    }
  ],
  "totalResults": 25,
  "page": 0,
  "pageSize": 10,
  "searchTimeMs": 45,
  "suggestions": ["programming", "java development"]
}
```

#### Get Search History
```http
GET /api/search/history
```

#### Get Popular Queries
```http
GET /api/search/popular?days={days}
```

### Document Management Endpoints

#### Index Document
```http
POST /api/documents
Content-Type: application/x-www-form-urlencoded

title=Document Title&content=Document content&url=https://example.com
```

#### Upload File
```http
POST /api/documents/upload
Content-Type: multipart/form-data

file: [binary file data]
title: Optional custom title
url: Optional custom URL
```

#### Index File Path
```http
POST /api/documents/index-path
Content-Type: application/x-www-form-urlencoded

path=/path/to/document.pdf&title=Custom Title&url=https://example.com
```

#### Index Directory
```http
POST /api/documents/index-directory
Content-Type: application/x-www-form-urlencoded

path=/path/to/documents&recursive=true
```

#### Get All Documents
```http
GET /api/documents
```

#### Delete Document
```http
DELETE /api/documents/{id}
```

#### Reindex All Documents
```http
POST /api/documents/reindex
```

#### Get Document Statistics
```http
GET /api/documents/stats
```

## 🔧 Configuration

### Backend Configuration

#### Application Properties
```properties
# Server Configuration
server.port=8080

# Database Configuration
spring.datasource.url=jdbc:h2:mem:searchengine
spring.datasource.username=sa
spring.datasource.password=

# Search Engine Configuration
search.index.directory=./lucene-index
search.max.results.per.page=100
search.default.page.size=10

# File Upload Configuration
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

#### Production Configuration
For production, create `application-prod.properties`:
```properties
# Database Configuration (PostgreSQL)
spring.datasource.url=jdbc:postgresql://localhost:5432/searchengine
spring.datasource.username=${DB_USERNAME:searchengine}
spring.datasource.password=${DB_PASSWORD:password}

# Search Engine Configuration
search.index.directory=${SEARCH_INDEX_DIR:./lucene-index}

# Logging Configuration
logging.level.com.searchengine=INFO
logging.file.name=logs/search-engine.log
```

### Frontend Configuration

#### Environment Variables
Create `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:8080/api
```

## 📁 Project Structure

```
search-engine/
├── backend/                          # Spring Boot backend
│   ├── src/main/java/com/searchengine/
│   │   ├── SearchEngineApplication.java
│   │   ├── controller/               # REST controllers
│   │   │   ├── SearchController.java
│   │   │   └── DocumentController.java
│   │   ├── service/                  # Business logic
│   │   │   ├── SearchService.java
│   │   │   ├── DocumentIndexingService.java
│   │   │   └── LuceneSearchService.java
│   │   ├── model/                    # JPA entities
│   │   │   ├── Document.java
│   │   │   └── SearchHistory.java
│   │   ├── repository/               # Data access
│   │   │   ├── DocumentRepository.java
│   │   │   └── SearchHistoryRepository.java
│   │   ├── dto/                      # Data transfer objects
│   │   │   ├── SearchResultDto.java
│   │   │   └── SearchResponseDto.java
│   │   └── config/                   # Configuration
│   │       ├── SecurityConfig.java
│   │       └── AsyncConfig.java
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── application-prod.properties
│   └── pom.xml
├── frontend/                         # React frontend
│   ├── src/
│   │   ├── components/               # React components
│   │   │   ├── SearchPage.js
│   │   │   ├── SearchResults.js
│   │   │   ├── AdminPage.js
│   │   │   ├── DocumentUpload.js
│   │   │   ├── DocumentManager.js
│   │   │   └── SearchAnalytics.js
│   │   ├── services/                 # API services
│   │   │   ├── SearchService.js
│   │   │   └── DocumentService.js
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   ├── package.json
│   └── nginx.conf
├── database/
│   └── init.sql                      # Database initialization
├── sample-documents/                 # Sample documents for testing
├── docs/                             # Documentation
├── docker-compose.yml                # Production deployment
├── docker-compose.dev.yml            # Development deployment
├── backend.Dockerfile
├── frontend.Dockerfile
└── README.md
```

## 🎯 Usage Guide

### 1. Indexing Documents

#### Manual Document Entry
1. Navigate to Admin → Document Upload → Manual Entry
2. Enter title, content, and optional URL
3. Click "Index Document"

#### File Upload
1. Navigate to Admin → Document Upload → File Upload
2. Select or drag-and-drop a file
3. Optionally provide custom title and URL
4. Click "Upload & Index"

#### Directory Indexing
1. Navigate to Admin → Document Upload → Directory
2. Enter the directory path
3. Choose whether to index recursively
4. Click "Index Directory"

### 2. Searching

#### Basic Search
- Enter search terms in the search box
- Use natural language queries
- Results are ranked by relevance

#### Advanced Search Features
- **Phrase Search**: Use quotes for exact phrases: `"java programming"`
- **Boolean Search**: Use AND, OR, NOT operators: `java AND spring`
- **Wildcard Search**: Use `*` for wildcard matching: `program*`
- **Field Search**: Search specific fields: `title:java`

### 3. Managing Documents

#### View All Documents
Navigate to Admin → Document Management to see all indexed documents with:
- Document details (title, URL, content type, size)
- Indexing status
- Creation and modification dates
- Actions (view details, delete)

#### Document Statistics
View statistics including:
- Total and indexed document counts
- Document distribution by content type
- Storage and performance metrics

### 4. Analytics and Monitoring

#### Search Analytics
Navigate to Admin → Search Analytics to view:
- Popular search queries
- Recent search history
- Performance metrics (average search time)
- Search trends and patterns

#### Performance Monitoring
Monitor key metrics:
- Search response times
- Index size and optimization
- Document indexing rates
- System resource usage

## 🔍 Search Features

### Query Processing
- **Text Analysis**: Documents are analyzed using StandardAnalyzer
- **Term Extraction**: Important terms are extracted and weighted
- **Query Parsing**: Support for complex query syntax
- **Fuzzy Matching**: Find similar terms automatically

### Ranking Algorithm
Results are ranked based on:
- **Term Frequency (TF)**: How often terms appear in documents
- **Inverse Document Frequency (IDF)**: Rarity of terms across the collection
- **Field Boosting**: Title matches ranked higher than content matches
- **Document Freshness**: Newer documents get slight boost

### Result Enhancement
- **Snippet Generation**: Relevant excerpts from documents
- **Term Highlighting**: Search terms highlighted in results
- **Content Summarization**: Automatic summary generation
- **Duplicate Detection**: Similar documents identified and grouped

## 🚀 Deployment

### Development Deployment
```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose logs -f

# Stop environment
docker-compose down
```

### Production Deployment
```bash
# Start production environment
docker-compose up -d

# Scale services (if needed)
docker-compose up -d --scale backend=2

# Update application
docker-compose pull
docker-compose up -d --no-deps backend frontend

# Backup data
docker exec search-engine-db pg_dump -U searchengine searchengine > backup.sql
```

### Environment Variables
Set these environment variables for production:
```bash
export DB_USERNAME=your_db_username
export DB_PASSWORD=your_db_password
export SEARCH_INDEX_DIR=/data/lucene-index
export SPRING_PROFILES_ACTIVE=prod
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
./mvnw test                          # Run unit tests
./mvnw integration-test              # Run integration tests
./mvnw verify                        # Run all tests
```

### Frontend Testing
```bash
cd frontend
npm test                             # Run unit tests
npm test -- --coverage              # Run tests with coverage
npm run test:e2e                     # Run end-to-end tests
```

### API Testing
Use the included sample requests:
```bash
# Index a sample document
curl -X POST "http://localhost:8080/api/documents" \
  -d "title=Test Document&content=This is test content&url=http://example.com"

# Search for documents
curl "http://localhost:8080/api/search?q=test&page=0&size=10"

# Get document statistics
curl "http://localhost:8080/api/documents/stats"
```

## 📊 Performance

### Benchmarks
On a typical development machine (8GB RAM, SSD):
- **Indexing Speed**: ~1,000 documents/minute
- **Search Response Time**: <100ms for typical queries
- **Index Size**: ~20-30% of original document size
- **Memory Usage**: <512MB for 10,000 documents

### Optimization Tips
1. **Index Optimization**: Run reindexing periodically
2. **Memory Settings**: Adjust JVM heap size for large indexes
3. **Disk Space**: Monitor index directory for sufficient space
4. **Query Optimization**: Use specific terms rather than wildcards
5. **Caching**: Implement result caching for frequently accessed content

## 🔒 Security

### Authentication & Authorization
- Basic security configuration included
- CORS enabled for frontend integration
- Rate limiting can be added for production use

### Data Protection
- Input validation on all endpoints
- XSS protection through content sanitization
- SQL injection prevention via JPA

### Production Security Checklist
- [ ] Change default database credentials
- [ ] Enable HTTPS/TLS
- [ ] Configure proper CORS origins
- [ ] Set up authentication for admin endpoints
- [ ] Regular security updates
- [ ] Monitor access logs

## 🐛 Troubleshooting

### Common Issues

#### Index Lock Errors
```bash
# Remove lock files (ONLY when application is stopped)
rm -f lucene-index/write.lock
```

#### Memory Issues
```bash
# Increase JVM heap size
export JAVA_OPTS="-Xmx2g -Xms1g"
```

#### Database Connection Issues
```bash
# Check database connectivity
docker exec -it search-engine-db psql -U searchengine -d searchengine
```

#### Port Conflicts
```bash
# Check port usage
netstat -an | grep :8080
netstat -an | grep :3000
```

### Logging
Enable debug logging by adding to `application.properties`:
```properties
logging.level.com.searchengine=DEBUG
logging.level.org.apache.lucene=DEBUG
```

### Performance Monitoring
Access application metrics at:
- Health Check: http://localhost:8080/actuator/health
- Metrics: http://localhost:8080/actuator/metrics

## 📝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and add tests
4. Commit your changes: `git commit -am 'Add new feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

### Development Guidelines
- Follow Java coding conventions
- Write unit tests for new features
- Update documentation for API changes
- Use meaningful commit messages

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Apache Lucene](https://lucene.apache.org/) - Core search functionality
- [Spring Boot](https://spring.io/projects/spring-boot) - Application framework
- [React](https://reactjs.org/) - Frontend framework
- [Apache Tika](https://tika.apache.org/) - Document content extraction

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `/docs` directory
- Review the troubleshooting section above

---

**Built with ❤️ using Java, Spring Boot, React, and Apache Lucene**