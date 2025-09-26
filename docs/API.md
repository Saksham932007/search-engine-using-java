# API Documentation

## Java Search Engine REST API

Base URL: `http://localhost:8080/api`

### Authentication
Currently, the API does not require authentication. For production use, consider implementing proper authentication and authorization.

---

## Search Endpoints

### 1. Search Documents

**Endpoint:** `GET /search`

**Description:** Search for documents using full-text search with Apache Lucene.

**Parameters:**
- `q` (required, string): The search query
- `page` (optional, integer, default: 0): Page number for pagination
- `size` (optional, integer, default: 10, max: 100): Number of results per page

**Example Request:**
```http
GET /api/search?q=java%20programming&page=0&size=10
```

**Example Response:**
```json
{
  "query": "java programming",
  "results": [
    {
      "id": 1,
      "title": "Introduction to Java Programming",
      "content": "Java is a high-level programming language...",
      "url": "https://docs.oracle.com/javase/tutorial/",
      "highlightedContent": "Java is a high-level <mark>programming</mark> language...",
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

**Response Codes:**
- `200 OK`: Search completed successfully
- `400 Bad Request`: Invalid query parameters
- `500 Internal Server Error`: Server error during search

---

### 2. Get Search History

**Endpoint:** `GET /search/history`

**Description:** Retrieve recent search history.

**Example Request:**
```http
GET /api/search/history
```

**Example Response:**
```json
[
  {
    "id": 1,
    "query": "java programming",
    "resultsCount": 25,
    "searchTimeMs": 45,
    "userIp": "127.0.0.1",
    "createdAt": "2023-01-01T10:00:00Z"
  }
]
```

---

### 3. Get Popular Queries

**Endpoint:** `GET /search/popular`

**Description:** Get the most popular search queries within a specified time period.

**Parameters:**
- `days` (optional, integer, default: 7): Number of days to look back

**Example Request:**
```http
GET /api/search/popular?days=30
```

**Example Response:**
```json
[
  ["java programming", 15],
  ["spring boot", 12],
  ["database design", 8]
]
```

---

### 4. Get Average Search Time

**Endpoint:** `GET /search/stats/average-time`

**Description:** Get average search response time statistics.

**Parameters:**
- `days` (optional, integer, default: 7): Number of days to analyze

**Example Request:**
```http
GET /api/search/stats/average-time?days=7
```

**Example Response:**
```json
42.5
```

---

## Document Management Endpoints

### 1. Index Document

**Endpoint:** `POST /documents`

**Description:** Index a new document for searching.

**Content-Type:** `application/x-www-form-urlencoded`

**Parameters:**
- `title` (required, string): Document title
- `content` (required, string): Document content
- `url` (required, string): Document URL

**Example Request:**
```http
POST /api/documents
Content-Type: application/x-www-form-urlencoded

title=My%20Document&content=This%20is%20the%20content&url=https://example.com/doc
```

**Example Response:**
```json
{
  "id": 1,
  "title": "My Document",
  "content": "This is the content",
  "url": "https://example.com/doc",
  "contentType": "text/html",
  "fileSize": null,
  "createdAt": "2023-01-01T10:00:00Z",
  "updatedAt": null,
  "indexedAt": "2023-01-01T10:00:05Z",
  "isIndexed": true
}
```

---

### 2. Upload File

**Endpoint:** `POST /documents/upload`

**Description:** Upload and index a file.

**Content-Type:** `multipart/form-data`

**Parameters:**
- `file` (required, file): The file to upload and index
- `title` (optional, string): Custom title for the document
- `url` (optional, string): Custom URL for the document

**Supported File Types:**
- Text files (.txt)
- PDF documents (.pdf)
- Microsoft Word documents (.doc, .docx)
- HTML files (.html)
- XML files (.xml)
- Rich Text Format (.rtf)
- OpenDocument Text (.odt)

**Example Request:**
```http
POST /api/documents/upload
Content-Type: multipart/form-data

file: [binary file data]
title: Custom Document Title
url: https://example.com/custom-url
```

---

### 3. Index File Path

**Endpoint:** `POST /documents/index-path`

**Description:** Index a file from a server file path.

**Content-Type:** `application/x-www-form-urlencoded`

**Parameters:**
- `path` (required, string): Absolute file path on the server
- `title` (optional, string): Custom title
- `url` (optional, string): Custom URL

**Example Request:**
```http
POST /api/documents/index-path
Content-Type: application/x-www-form-urlencoded

path=/path/to/document.pdf&title=Custom%20Title&url=https://example.com
```

---

### 4. Index Directory

**Endpoint:** `POST /documents/index-directory`

**Description:** Index all supported files in a directory.

**Content-Type:** `application/x-www-form-urlencoded`

**Parameters:**
- `path` (required, string): Directory path to index
- `recursive` (optional, boolean, default: false): Whether to index subdirectories

**Example Request:**
```http
POST /api/documents/index-directory
Content-Type: application/x-www-form-urlencoded

path=/documents/folder&recursive=true
```

**Example Response:**
```json
{
  "message": "Directory indexing started",
  "path": "/documents/folder",
  "recursive": true
}
```

---

### 5. Get All Documents

**Endpoint:** `GET /documents`

**Description:** Retrieve all indexed documents.

**Example Request:**
```http
GET /api/documents
```

**Example Response:**
```json
[
  {
    "id": 1,
    "title": "Document Title",
    "content": "Document content...",
    "url": "https://example.com/doc",
    "contentType": "text/html",
    "fileSize": 1024,
    "createdAt": "2023-01-01T10:00:00Z",
    "updatedAt": null,
    "indexedAt": "2023-01-01T10:00:05Z",
    "isIndexed": true
  }
]
```

---

### 6. Update Document

**Endpoint:** `PUT /documents/{id}`

**Description:** Update an existing document.

**Parameters:**
- `id` (path parameter): Document ID
- `title` (required, string): Updated title
- `content` (required, string): Updated content
- `url` (required, string): Updated URL

**Example Request:**
```http
PUT /api/documents/1
Content-Type: application/x-www-form-urlencoded

title=Updated%20Title&content=Updated%20content&url=https://example.com/updated
```

---

### 7. Delete Document

**Endpoint:** `DELETE /documents/{id}`

**Description:** Delete a document and remove it from the search index.

**Parameters:**
- `id` (path parameter): Document ID to delete

**Example Request:**
```http
DELETE /api/documents/1
```

**Example Response:**
```json
{
  "message": "Document deleted successfully",
  "id": 1
}
```

---

### 8. Get Unindexed Documents

**Endpoint:** `GET /documents/unindexed`

**Description:** Get documents that failed to index.

**Example Request:**
```http
GET /api/documents/unindexed
```

---

### 9. Reindex All Documents

**Endpoint:** `POST /documents/reindex`

**Description:** Trigger reindexing of all documents in the background.

**Example Request:**
```http
POST /api/documents/reindex
```

**Example Response:**
```json
{
  "message": "Reindexing started",
  "status": "in-progress"
}
```

---

### 10. Get Document Statistics

**Endpoint:** `GET /documents/stats`

**Description:** Get statistics about indexed documents.

**Example Request:**
```http
GET /api/documents/stats
```

**Example Response:**
```json
{
  "indexedCount": 150,
  "statsByContentType": [
    ["text/html", 75],
    ["application/pdf", 50],
    ["text/plain", 25]
  ]
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "timestamp": "2023-01-01T10:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid request parameters",
  "path": "/api/search"
}
```

### 404 Not Found
```json
{
  "timestamp": "2023-01-01T10:00:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "Document not found",
  "path": "/api/documents/999"
}
```

### 500 Internal Server Error
```json
{
  "timestamp": "2023-01-01T10:00:00Z",
  "status": 500,
  "error": "Internal Server Error",
  "message": "An error occurred while processing the request",
  "path": "/api/search"
}
```

---

## Rate Limiting

Currently, there are no rate limits implemented. For production deployments, consider implementing rate limiting to prevent abuse.

## CORS Policy

The API is configured to accept requests from any origin (`*`) for development purposes. In production, configure specific allowed origins.

---

## Example Usage with cURL

### Search for documents:
```bash
curl "http://localhost:8080/api/search?q=java%20programming&page=0&size=5"
```

### Index a document:
```bash
curl -X POST "http://localhost:8080/api/documents" \
  -d "title=Test Document" \
  -d "content=This is test content" \
  -d "url=http://example.com/test"
```

### Upload a file:
```bash
curl -X POST "http://localhost:8080/api/documents/upload" \
  -F "file=@document.pdf" \
  -F "title=My PDF Document"
```

### Get document statistics:
```bash
curl "http://localhost:8080/api/documents/stats"
```

---

This API documentation covers all available endpoints. For more details about the implementation, refer to the source code and the main README.md file.