package com.searchengine.service;

import com.searchengine.dto.SearchResponseDto;
import com.searchengine.model.Document;
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
class SearchServiceTest {

    @Autowired
    private SearchService searchService;

    @Autowired
    private DocumentIndexingService documentIndexingService;

    @BeforeEach
    void setUp() {
        // Index some test documents
        documentIndexingService.indexDocument(
                "Java Programming Guide",
                "Java is a programming language. Learn Java programming with examples.",
                "http://test.com/java"
        );

        documentIndexingService.indexDocument(
                "Spring Boot Tutorial",
                "Spring Boot makes it easy to create stand-alone applications.",
                "http://test.com/spring"
        );

        documentIndexingService.indexDocument(
                "Database Design",
                "Database design principles and best practices for developers.",
                "http://test.com/database"
        );
    }

    @Test
    void testSearch() {
        SearchResponseDto response = searchService.search("Java programming", 0, 10);

        assertNotNull(response);
        assertEquals("Java programming", response.getQuery());
        assertNotNull(response.getResults());
        assertTrue(response.getTotalResults() > 0);
        assertNotNull(response.getSearchTimeMs());
        assertEquals(0, response.getPage());
        assertEquals(10, response.getPageSize());
    }

    @Test
    void testSearchWithPagination() {
        SearchResponseDto response = searchService.search("programming", 0, 2);

        assertNotNull(response);
        assertTrue(response.getResults().size() <= 2);
        assertEquals(0, response.getPage());
        assertEquals(2, response.getPageSize());
    }

    @Test
    void testSearchNoResults() {
        SearchResponseDto response = searchService.search("nonexistent query xyz", 0, 10);

        assertNotNull(response);
        assertEquals("nonexistent query xyz", response.getQuery());
        assertNotNull(response.getResults());
        assertEquals(0, response.getTotalResults());
    }

    @Test
    void testGetRecentSearches() {
        // Perform some searches to generate history
        searchService.search("Java", 0, 10);
        searchService.search("Spring", 0, 10);

        var recentSearches = searchService.getRecentSearches(10);
        assertNotNull(recentSearches);
        assertTrue(recentSearches.size() >= 2);
    }
}