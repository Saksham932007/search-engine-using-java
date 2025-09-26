package com.searchengine.service;

import com.searchengine.model.Document;
import com.searchengine.repository.DocumentRepository;
import org.apache.tika.Tika;
import org.apache.tika.exception.TikaException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

@Service
@Transactional
public class DocumentIndexingService {
    
    private static final Logger logger = LoggerFactory.getLogger(DocumentIndexingService.class);
    
    @Autowired
    private DocumentRepository documentRepository;
    
    @Autowired
    private LuceneSearchService luceneSearchService;
    
    private final Tika tika = new Tika();
    
    public Document indexDocument(String title, String content, String url) {
        try {
            // Check if document already exists
            Optional<Document> existingDoc = documentRepository.findByUrl(url);
            if (existingDoc.isPresent()) {
                logger.info("Document with URL '{}' already exists. Updating...", url);
                return updateDocument(existingDoc.get().getId(), title, content, url);
            }
            
            // Create new document
            Document document = new Document(title, content, url);
            document.setContentType("text/html");
            document = documentRepository.save(document);
            
            // Index in Lucene
            luceneSearchService.indexDocument(document);
            
            // Mark as indexed
            document.setIsIndexed(true);
            document.setIndexedAt(LocalDateTime.now());
            document = documentRepository.save(document);
            
            logger.info("Successfully indexed document: {} (ID: {})", title, document.getId());
            return document;
            
        } catch (Exception e) {
            logger.error("Error indexing document '{}': {}", title, e.getMessage(), e);
            throw new RuntimeException("Failed to index document: " + e.getMessage(), e);
        }
    }
    
    public Document updateDocument(Long documentId, String title, String content, String url) {
        try {
            Optional<Document> optionalDoc = documentRepository.findById(documentId);
            if (!optionalDoc.isPresent()) {
                throw new IllegalArgumentException("Document with ID " + documentId + " not found");
            }
            
            Document document = optionalDoc.get();
            document.setTitle(title);
            document.setContent(content);
            document.setUrl(url);
            document.setUpdatedAt(LocalDateTime.now());
            document = documentRepository.save(document);
            
            // Update in Lucene
            luceneSearchService.updateDocument(document);
            
            // Mark as indexed
            document.setIsIndexed(true);
            document.setIndexedAt(LocalDateTime.now());
            document = documentRepository.save(document);
            
            logger.info("Successfully updated document: {} (ID: {})", title, document.getId());
            return document;
            
        } catch (Exception e) {
            logger.error("Error updating document with ID {}: {}", documentId, e.getMessage(), e);
            throw new RuntimeException("Failed to update document: " + e.getMessage(), e);
        }
    }
    
    public void deleteDocument(Long documentId) {
        try {
            Optional<Document> optionalDoc = documentRepository.findById(documentId);
            if (!optionalDoc.isPresent()) {
                throw new IllegalArgumentException("Document with ID " + documentId + " not found");
            }
            
            // Delete from Lucene index
            luceneSearchService.deleteDocument(documentId);
            
            // Delete from database
            documentRepository.deleteById(documentId);
            
            logger.info("Successfully deleted document with ID: {}", documentId);
            
        } catch (Exception e) {
            logger.error("Error deleting document with ID {}: {}", documentId, e.getMessage(), e);
            throw new RuntimeException("Failed to delete document: " + e.getMessage(), e);
        }
    }
    
    public Document indexFile(MultipartFile file, String title, String url) throws IOException, TikaException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        
        // Extract text content using Tika
        String content = tika.parseToString(file.getInputStream());
        String contentType = file.getContentType();
        long fileSize = file.getSize();
        
        // Use filename as title if not provided
        if (title == null || title.trim().isEmpty()) {
            title = file.getOriginalFilename();
        }
        
        // Generate URL if not provided
        if (url == null || url.trim().isEmpty()) {
            url = "file://" + file.getOriginalFilename();
        }
        
        try {
            Document document = new Document(title, content, url);
            document.setContentType(contentType);
            document.setFileSize(fileSize);
            document = documentRepository.save(document);
            
            // Index in Lucene
            luceneSearchService.indexDocument(document);
            
            // Mark as indexed
            document.setIsIndexed(true);
            document.setIndexedAt(LocalDateTime.now());
            document = documentRepository.save(document);
            
            logger.info("Successfully indexed file: {} (ID: {})", title, document.getId());
            return document;
            
        } catch (Exception e) {
            logger.error("Error indexing file '{}': {}", file.getOriginalFilename(), e.getMessage(), e);
            throw new RuntimeException("Failed to index file: " + e.getMessage(), e);
        }
    }
    
    public Document indexFileFromPath(String filePath, String title, String url) throws IOException, TikaException {
        Path path = Paths.get(filePath);
        if (!Files.exists(path)) {
            throw new IllegalArgumentException("File does not exist: " + filePath);
        }
        
        // Extract text content using Tika
        String content = tika.parseToString(path);
        String contentType = tika.detect(path);
        long fileSize = Files.size(path);
        
        // Use filename as title if not provided
        if (title == null || title.trim().isEmpty()) {
            title = path.getFileName().toString();
        }
        
        // Generate URL if not provided
        if (url == null || url.trim().isEmpty()) {
            url = "file://" + path.toAbsolutePath().toString();
        }
        
        try {
            Document document = new Document(title, content, url);
            document.setContentType(contentType);
            document.setFileSize(fileSize);
            document.setFilePath(filePath);
            document = documentRepository.save(document);
            
            // Index in Lucene
            luceneSearchService.indexDocument(document);
            
            // Mark as indexed
            document.setIsIndexed(true);
            document.setIndexedAt(LocalDateTime.now());
            document = documentRepository.save(document);
            
            logger.info("Successfully indexed file from path: {} (ID: {})", filePath, document.getId());
            return document;
            
        } catch (Exception e) {
            logger.error("Error indexing file from path '{}': {}", filePath, e.getMessage(), e);
            throw new RuntimeException("Failed to index file: " + e.getMessage(), e);
        }
    }
    
    @Async
    public CompletableFuture<Void> reindexAllDocuments() {
        logger.info("Starting reindexing of all documents...");
        
        try {
            List<Document> documents = documentRepository.findAll();
            int total = documents.size();
            int indexed = 0;
            int errors = 0;
            
            for (Document document : documents) {
                try {
                    luceneSearchService.updateDocument(document);
                    document.setIsIndexed(true);
                    document.setIndexedAt(LocalDateTime.now());
                    documentRepository.save(document);
                    indexed++;
                } catch (Exception e) {
                    logger.error("Error reindexing document {}: {}", document.getId(), e.getMessage());
                    document.setIsIndexed(false);
                    documentRepository.save(document);
                    errors++;
                }
            }
            
            logger.info("Reindexing completed. Total: {}, Indexed: {}, Errors: {}", total, indexed, errors);
            
        } catch (Exception e) {
            logger.error("Error during reindexing: {}", e.getMessage(), e);
        }
        
        return CompletableFuture.completedFuture(null);
    }
    
    public void indexDirectory(String directoryPath, boolean recursive) throws IOException, TikaException {
        Path dirPath = Paths.get(directoryPath);
        if (!Files.exists(dirPath) || !Files.isDirectory(dirPath)) {
            throw new IllegalArgumentException("Invalid directory path: " + directoryPath);
        }
        
        logger.info("Starting indexing of directory: {}", directoryPath);
        
        Files.walk(dirPath, recursive ? Integer.MAX_VALUE : 1)
            .filter(Files::isRegularFile)
            .filter(path -> isIndexableFile(path))
            .forEach(path -> {
                try {
                    indexFileFromPath(path.toString(), null, null);
                } catch (Exception e) {
                    logger.error("Error indexing file {}: {}", path, e.getMessage());
                }
            });
        
        logger.info("Directory indexing completed for: {}", directoryPath);
    }
    
    private boolean isIndexableFile(Path path) {
        String fileName = path.getFileName().toString().toLowerCase();
        return fileName.endsWith(".txt") || fileName.endsWith(".pdf") || 
               fileName.endsWith(".doc") || fileName.endsWith(".docx") ||
               fileName.endsWith(".html") || fileName.endsWith(".xml") ||
               fileName.endsWith(".rtf") || fileName.endsWith(".odt");
    }
    
    public List<Document> getAllDocuments() {
        return documentRepository.findAll();
    }
    
    public List<Document> getUnindexedDocuments() {
        return documentRepository.findByIsIndexed(false);
    }
    
    public Long getIndexedDocumentCount() {
        return documentRepository.countIndexedDocuments();
    }
    
    public List<Object[]> getDocumentStatsByContentType() {
        return documentRepository.countDocumentsByContentType();
    }
}