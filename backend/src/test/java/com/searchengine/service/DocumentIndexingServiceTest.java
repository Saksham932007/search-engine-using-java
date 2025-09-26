package com.searchengine.service;

import com.searchengine.model.Document;
import com.searchengine.repository.DocumentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class DocumentIndexingServiceTest {

    @Autowired
    private DocumentIndexingService documentIndexingService;

    @Autowired
    private DocumentRepository documentRepository;

    private Document testDocument;

    @BeforeEach
    void setUp() {
        testDocument = new Document();
        testDocument.setTitle("Test Document");
        testDocument.setContent("This is test content for searching");
        testDocument.setUrl("http://test.com/document");
    }

    @Test
    void testIndexDocument() {
        Document indexed = documentIndexingService.indexDocument(
                testDocument.getTitle(),
                testDocument.getContent(),
                testDocument.getUrl()
        );

        assertNotNull(indexed);
        assertNotNull(indexed.getId());
        assertEquals(testDocument.getTitle(), indexed.getTitle());
        assertEquals(testDocument.getContent(), indexed.getContent());
        assertEquals(testDocument.getUrl(), indexed.getUrl());
        assertTrue(indexed.getIsIndexed());
        assertNotNull(indexed.getIndexedAt());
    }

    @Test
    void testGetAllDocuments() {
        // Index a test document first
        documentIndexingService.indexDocument(
                testDocument.getTitle(),
                testDocument.getContent(),
                testDocument.getUrl()
        );

        var documents = documentIndexingService.getAllDocuments();
        assertNotNull(documents);
        assertTrue(documents.size() > 0);
    }

    @Test
    void testGetIndexedDocumentCount() {
        Long countBefore = documentIndexingService.getIndexedDocumentCount();
        
        documentIndexingService.indexDocument(
                testDocument.getTitle(),
                testDocument.getContent(),
                testDocument.getUrl()
        );

        Long countAfter = documentIndexingService.getIndexedDocumentCount();
        assertTrue(countAfter > countBefore);
    }
}