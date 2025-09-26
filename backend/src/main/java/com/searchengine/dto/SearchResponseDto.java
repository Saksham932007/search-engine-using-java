package com.searchengine.dto;

import java.util.List;

public class SearchResponseDto {
    private String query;
    private List<SearchResultDto> results;
    private Integer totalResults;
    private Integer page;
    private Integer pageSize;
    private Long searchTimeMs;
    private List<String> suggestions;

    // Constructors
    public SearchResponseDto() {}

    public SearchResponseDto(String query, List<SearchResultDto> results, Integer totalResults, Long searchTimeMs) {
        this.query = query;
        this.results = results;
        this.totalResults = totalResults;
        this.searchTimeMs = searchTimeMs;
    }

    // Getters and Setters
    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }

    public List<SearchResultDto> getResults() {
        return results;
    }

    public void setResults(List<SearchResultDto> results) {
        this.results = results;
    }

    public Integer getTotalResults() {
        return totalResults;
    }

    public void setTotalResults(Integer totalResults) {
        this.totalResults = totalResults;
    }

    public Integer getPage() {
        return page;
    }

    public void setPage(Integer page) {
        this.page = page;
    }

    public Integer getPageSize() {
        return pageSize;
    }

    public void setPageSize(Integer pageSize) {
        this.pageSize = pageSize;
    }

    public Long getSearchTimeMs() {
        return searchTimeMs;
    }

    public void setSearchTimeMs(Long searchTimeMs) {
        this.searchTimeMs = searchTimeMs;
    }

    public List<String> getSuggestions() {
        return suggestions;
    }

    public void setSuggestions(List<String> suggestions) {
        this.suggestions = suggestions;
    }
}