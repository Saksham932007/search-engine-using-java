package com.searchengine.service;

import com.searchengine.dto.SearchResponseDto;
import com.searchengine.dto.SearchResultDto;
import com.searchengine.model.Document;
import com.searchengine.model.SearchHistory;
import com.searchengine.repository.DocumentRepository;
import com.searchengine.repository.SearchHistoryRepository;
import org.apache.lucene.queryparser.classic.ParseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class SearchService {
    
    private static final Logger logger = LoggerFactory.getLogger(SearchService.class);
    
    @Autowired
    private LuceneSearchService luceneSearchService;
    
    @Autowired
    private DocumentRepository documentRepository;
    
    @Autowired
    private SearchHistoryRepository searchHistoryRepository;
    
    public SearchResponseDto search(String query, int page, int pageSize) {
        long startTime = System.currentTimeMillis();
        
        try {
            // Perform Lucene search
            int maxResults = (page + 1) * pageSize; // Get more results for pagination
            List<SearchResultDto> allResults = luceneSearchService.search(query, maxResults);
            
            // Apply pagination
            int startIndex = page * pageSize;
            int endIndex = Math.min(startIndex + pageSize, allResults.size());
            List<SearchResultDto> paginatedResults = new ArrayList<>();
            
            if (startIndex < allResults.size()) {
                paginatedResults = allResults.subList(startIndex, endIndex);
            }
            
            // Enrich results with database information
            for (SearchResultDto result : paginatedResults) {
                Optional<Document> doc = documentRepository.findById(result.getId());
                if (doc.isPresent()) {
                    result.setCreatedAt(doc.get().getCreatedAt());
                }
            }
            
            long searchTime = System.currentTimeMillis() - startTime;
            
            // Create response
            SearchResponseDto response = new SearchResponseDto();
            response.setQuery(query);
            response.setResults(paginatedResults);
            response.setTotalResults(allResults.size());
            response.setPage(page);
            response.setPageSize(pageSize);
            response.setSearchTimeMs(searchTime);
            
            // Add suggestions
            try {
                List<String> suggestions = luceneSearchService.getSuggestions(query, 5);
                response.setSuggestions(suggestions);
            } catch (Exception e) {
                logger.warn("Error getting suggestions for query '{}': {}", query, e.getMessage());
                response.setSuggestions(new ArrayList<>());
            }
            
            // Save search history
            saveSearchHistory(query, allResults.size(), searchTime);
            
            logger.info("Search completed for query '{}': {} results in {}ms", 
                       query, allResults.size(), searchTime);
            
            return response;
            
        } catch (IOException | ParseException e) {
            logger.error("Error performing search for query '{}': {}", query, e.getMessage(), e);
            
            // Fallback to database search
            return performDatabaseSearch(query, page, pageSize, startTime);
        }
    }
    
    private SearchResponseDto performDatabaseSearch(String query, int page, int pageSize, long startTime) {
        logger.info("Performing fallback database search for query: {}", query);
        
        try {
            Pageable pageable = PageRequest.of(page, pageSize);
            Page<Document> documentPage = documentRepository.findByKeyword(query, pageable);
            
            List<SearchResultDto> results = documentPage.getContent().stream()
                .map(this::convertToSearchResult)
                .collect(Collectors.toList());
            
            long searchTime = System.currentTimeMillis() - startTime;
            
            SearchResponseDto response = new SearchResponseDto();
            response.setQuery(query);
            response.setResults(results);
            response.setTotalResults((int) documentPage.getTotalElements());
            response.setPage(page);
            response.setPageSize(pageSize);
            response.setSearchTimeMs(searchTime);
            response.setSuggestions(new ArrayList<>());
            
            saveSearchHistory(query, (int) documentPage.getTotalElements(), searchTime);
            
            return response;
            
        } catch (Exception e) {
            logger.error("Error performing database search: {}", e.getMessage(), e);
            
            SearchResponseDto response = new SearchResponseDto();
            response.setQuery(query);
            response.setResults(new ArrayList<>());
            response.setTotalResults(0);
            response.setPage(page);
            response.setPageSize(pageSize);
            response.setSearchTimeMs(System.currentTimeMillis() - startTime);
            response.setSuggestions(new ArrayList<>());
            
            return response;
        }
    }
    
    private SearchResultDto convertToSearchResult(Document document) {
        SearchResultDto result = new SearchResultDto();
        result.setId(document.getId());
        result.setTitle(document.getTitle());
        result.setContent(document.getContent());
        result.setUrl(document.getUrl());
        result.setCreatedAt(document.getCreatedAt());
        result.setScore(1.0); // Default score for database results
        
        // Create a simple highlighted content (first 200 characters)
        String content = document.getContent();
        if (content != null && content.length() > 200) {
            result.setHighlightedContent(content.substring(0, 200) + "...");
        } else {
            result.setHighlightedContent(content);
        }
        
        return result;
    }
    
    private void saveSearchHistory(String query, int resultsCount, long searchTimeMs) {
        try {
            SearchHistory history = new SearchHistory(query, resultsCount, searchTimeMs);
            searchHistoryRepository.save(history);
        } catch (Exception e) {
            logger.warn("Error saving search history for query '{}': {}", query, e.getMessage());
        }
    }
    
    public List<SearchHistory> getRecentSearches(int limit) {
        return searchHistoryRepository.findTop10ByOrderByCreatedAtDesc();
    }
    
    public List<Object[]> getPopularQueries(int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        return searchHistoryRepository.findTopQueriesByFrequency(startDate);
    }
    
    public Double getAverageSearchTime(int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        return searchHistoryRepository.getAverageSearchTime(startDate);
    }
}