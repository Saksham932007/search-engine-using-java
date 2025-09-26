package com.searchengine.repository;

import com.searchengine.model.Document;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    
    Optional<Document> findByUrl(String url);
    
    List<Document> findByIsIndexed(Boolean isIndexed);
    
    Page<Document> findByTitleContainingIgnoreCaseOrContentContainingIgnoreCase(
            String title, String content, Pageable pageable);
    
    @Query("SELECT d FROM Document d WHERE " +
           "LOWER(d.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(d.content) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Document> findByKeyword(@Param("keyword") String keyword, Pageable pageable);
    
    @Query("SELECT d FROM Document d WHERE d.createdAt >= :startDate")
    List<Document> findByCreatedAtAfter(@Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT COUNT(d) FROM Document d WHERE d.isIndexed = true")
    Long countIndexedDocuments();
    
    @Query("SELECT d.contentType, COUNT(d) FROM Document d GROUP BY d.contentType")
    List<Object[]> countDocumentsByContentType();
}