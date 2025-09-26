package com.searchengine.controller;

import com.searchengine.dto.SearchResponseDto;
import com.searchengine.model.SearchHistory;
import com.searchengine.service.SearchService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/search")
@CrossOrigin(origins = "*", maxAge = 3600)
public class SearchController {
    
    private static final Logger logger = LoggerFactory.getLogger(SearchController.class);
    
    @Autowired
    private SearchService searchService;
    
    @GetMapping
    public ResponseEntity<SearchResponseDto> search(
            @RequestParam("q") String query,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int pageSize) {
        
        logger.info("Search request - Query: '{}', Page: {}, Size: {}", query, page, pageSize);
        
        try {
            if (query == null || query.trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            
            if (pageSize > 100) {
                pageSize = 100; // Limit page size to prevent abuse
            }
            
            SearchResponseDto response = searchService.search(query.trim(), page, pageSize);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error processing search request: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/history")
    public ResponseEntity<List<SearchHistory>> getSearchHistory() {
        try {
            List<SearchHistory> history = searchService.getRecentSearches(10);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            logger.error("Error getting search history: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/popular")
    public ResponseEntity<List<Object[]>> getPopularQueries(
            @RequestParam(value = "days", defaultValue = "7") int days) {
        try {
            List<Object[]> popularQueries = searchService.getPopularQueries(days);
            return ResponseEntity.ok(popularQueries);
        } catch (Exception e) {
            logger.error("Error getting popular queries: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/stats/average-time")
    public ResponseEntity<Double> getAverageSearchTime(
            @RequestParam(value = "days", defaultValue = "7") int days) {
        try {
            Double averageTime = searchService.getAverageSearchTime(days);
            return ResponseEntity.ok(averageTime != null ? averageTime : 0.0);
        } catch (Exception e) {
            logger.error("Error getting average search time: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}