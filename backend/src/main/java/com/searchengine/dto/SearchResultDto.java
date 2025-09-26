package com.searchengine.dto;

import java.time.LocalDateTime;

public class SearchResultDto {
    private Long id;
    private String title;
    private String content;
    private String url;
    private String highlightedContent;
    private Double score;
    private LocalDateTime createdAt;

    // Constructors
    public SearchResultDto() {}

    public SearchResultDto(Long id, String title, String content, String url, Double score) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.url = url;
        this.score = score;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getHighlightedContent() {
        return highlightedContent;
    }

    public void setHighlightedContent(String highlightedContent) {
        this.highlightedContent = highlightedContent;
    }

    public Double getScore() {
        return score;
    }

    public void setScore(Double score) {
        this.score = score;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}