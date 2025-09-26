package com.searchengine.controller;

import com.searchengine.model.Document;
import com.searchengine.service.DocumentIndexingService;
import org.apache.tika.exception.TikaException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DocumentController {
    
    private static final Logger logger = LoggerFactory.getLogger(DocumentController.class);
    
    @Autowired
    private DocumentIndexingService documentIndexingService;
    
    @PostMapping
    public ResponseEntity<Document> indexDocument(
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam("url") String url) {
        
        logger.info("Document indexing request - Title: '{}', URL: '{}'", title, url);
        
        try {
            if (title == null || title.trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            
            Document document = documentIndexingService.indexDocument(title.trim(), content, url);
            return ResponseEntity.ok(document);
            
        } catch (Exception e) {
            logger.error("Error indexing document: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/upload")
    public ResponseEntity<Document> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "url", required = false) String url) {
        
        logger.info("File upload request - Filename: '{}'", file.getOriginalFilename());
        
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            
            Document document = documentIndexingService.indexFile(file, title, url);
            return ResponseEntity.ok(document);
            
        } catch (IOException | TikaException e) {
            logger.error("Error uploading and indexing file: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/index-path")
    public ResponseEntity<Document> indexFilePath(
            @RequestParam("path") String filePath,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "url", required = false) String url) {
        
        logger.info("File path indexing request - Path: '{}'", filePath);
        
        try {
            Document document = documentIndexingService.indexFileFromPath(filePath, title, url);
            return ResponseEntity.ok(document);
            
        } catch (IOException | TikaException e) {
            logger.error("Error indexing file from path: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            logger.error("Unexpected error indexing file: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/index-directory")
    public ResponseEntity<Map<String, Object>> indexDirectory(
            @RequestParam("path") String directoryPath,
            @RequestParam(value = "recursive", defaultValue = "false") boolean recursive) {
        
        logger.info("Directory indexing request - Path: '{}', Recursive: {}", directoryPath, recursive);
        
        try {
            documentIndexingService.indexDirectory(directoryPath, recursive);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Directory indexing started");
            response.put("path", directoryPath);
            response.put("recursive", recursive);
            
            return ResponseEntity.ok(response);
            
        } catch (IOException | TikaException e) {
            logger.error("Error indexing directory: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Unexpected error indexing directory: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Document> updateDocument(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam("url") String url) {
        
        logger.info("Document update request - ID: {}, Title: '{}'", id, title);
        
        try {
            Document document = documentIndexingService.updateDocument(id, title.trim(), content, url);
            return ResponseEntity.ok(document);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error updating document: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteDocument(@PathVariable Long id) {
        logger.info("Document deletion request - ID: {}", id);
        
        try {
            documentIndexingService.deleteDocument(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Document deleted successfully");
            response.put("id", id);
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error deleting document: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping
    public ResponseEntity<List<Document>> getAllDocuments() {
        try {
            List<Document> documents = documentIndexingService.getAllDocuments();
            return ResponseEntity.ok(documents);
        } catch (Exception e) {
            logger.error("Error getting all documents: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/unindexed")
    public ResponseEntity<List<Document>> getUnindexedDocuments() {
        try {
            List<Document> documents = documentIndexingService.getUnindexedDocuments();
            return ResponseEntity.ok(documents);
        } catch (Exception e) {
            logger.error("Error getting unindexed documents: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/reindex")
    public ResponseEntity<Map<String, Object>> reindexAllDocuments() {
        logger.info("Reindex all documents request");
        
        try {
            CompletableFuture<Void> future = documentIndexingService.reindexAllDocuments();
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Reindexing started");
            response.put("status", "in-progress");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error starting reindexing: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDocumentStats() {
        try {
            Long indexedCount = documentIndexingService.getIndexedDocumentCount();
            List<Object[]> statsByType = documentIndexingService.getDocumentStatsByContentType();
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("indexedCount", indexedCount);
            stats.put("statsByContentType", statsByType);
            
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            logger.error("Error getting document stats: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}