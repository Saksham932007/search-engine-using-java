package com.searchengine.repository;

import com.searchengine.model.SearchHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SearchHistoryRepository extends JpaRepository<SearchHistory, Long> {
    
    Page<SearchHistory> findAllByOrderByCreatedAtDesc(Pageable pageable);
    
    List<SearchHistory> findTop10ByOrderByCreatedAtDesc();
    
    @Query("SELECT s.query, COUNT(s) as frequency FROM SearchHistory s " +
           "WHERE s.createdAt >= :startDate " +
           "GROUP BY s.query ORDER BY frequency DESC")
    List<Object[]> findTopQueriesByFrequency(@Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT s FROM SearchHistory s WHERE s.createdAt >= :startDate")
    List<SearchHistory> findByCreatedAtAfter(@Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT AVG(s.searchTimeMs) FROM SearchHistory s WHERE s.createdAt >= :startDate")
    Double getAverageSearchTime(@Param("startDate") LocalDateTime startDate);
}