package com.searchengine.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "search_history")
public class SearchHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String query;

    @Column(name = "results_count")
    private Integer resultsCount;

    @Column(name = "search_time_ms")
    private Long searchTimeMs;

    @Column(name = "user_ip")
    private String userIp;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // Constructors
    public SearchHistory() {
        this.createdAt = LocalDateTime.now();
    }

    public SearchHistory(String query, Integer resultsCount, Long searchTimeMs) {
        this();
        this.query = query;
        this.resultsCount = resultsCount;
        this.searchTimeMs = searchTimeMs;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }

    public Integer getResultsCount() {
        return resultsCount;
    }

    public void setResultsCount(Integer resultsCount) {
        this.resultsCount = resultsCount;
    }

    public Long getSearchTimeMs() {
        return searchTimeMs;
    }

    public void setSearchTimeMs(Long searchTimeMs) {
        this.searchTimeMs = searchTimeMs;
    }

    public String getUserIp() {
        return userIp;
    }

    public void setUserIp(String userIp) {
        this.userIp = userIp;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}