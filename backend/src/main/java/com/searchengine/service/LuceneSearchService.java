package com.searchengine.service;

import com.searchengine.dto.SearchResultDto;
import com.searchengine.model.Document;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.document.Field;
import org.apache.lucene.document.StoredField;
import org.apache.lucene.document.TextField;
import org.apache.lucene.index.DirectoryReader;
import org.apache.lucene.index.IndexReader;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.index.IndexWriterConfig;
import org.apache.lucene.queryparser.classic.MultiFieldQueryParser;
import org.apache.lucene.queryparser.classic.ParseException;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.search.Query;
import org.apache.lucene.search.ScoreDoc;
import org.apache.lucene.search.TopDocs;
import org.apache.lucene.search.highlight.*;
import org.apache.lucene.store.Directory;
import org.apache.lucene.store.FSDirectory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

@Service
public class LuceneSearchService {
    
    private static final Logger logger = LoggerFactory.getLogger(LuceneSearchService.class);
    
    @Value("${search.index.directory:./lucene-index}")
    private String indexDirectory;
    
    private Directory directory;
    private StandardAnalyzer analyzer;
    private IndexWriter indexWriter;
    
    @PostConstruct
    public void initialize() throws IOException {
        analyzer = new StandardAnalyzer();
        directory = FSDirectory.open(Paths.get(indexDirectory));
        
        IndexWriterConfig config = new IndexWriterConfig(analyzer);
        config.setOpenMode(IndexWriterConfig.OpenMode.CREATE_OR_APPEND);
        indexWriter = new IndexWriter(directory, config);
        
        logger.info("Lucene search service initialized with index directory: {}", indexDirectory);
    }
    
    @PreDestroy
    public void cleanup() throws IOException {
        if (indexWriter != null) {
            indexWriter.close();
        }
        if (directory != null) {
            directory.close();
        }
        analyzer.close();
        logger.info("Lucene search service cleaned up");
    }
    
    public void indexDocument(Document document) throws IOException {
        org.apache.lucene.document.Document luceneDoc = new org.apache.lucene.document.Document();
        
        luceneDoc.add(new StoredField("id", document.getId().toString()));
        luceneDoc.add(new TextField("title", document.getTitle() != null ? document.getTitle() : "", Field.Store.YES));
        luceneDoc.add(new TextField("content", document.getContent() != null ? document.getContent() : "", Field.Store.YES));
        luceneDoc.add(new StoredField("url", document.getUrl() != null ? document.getUrl() : ""));
        luceneDoc.add(new StoredField("contentType", document.getContentType() != null ? document.getContentType() : ""));
        
        indexWriter.addDocument(luceneDoc);
        indexWriter.commit();
        
        logger.debug("Indexed document: {} (ID: {})", document.getTitle(), document.getId());
    }
    
    public void updateDocument(Document document) throws IOException {
        deleteDocument(document.getId());
        indexDocument(document);
    }
    
    public void deleteDocument(Long documentId) throws IOException {
        indexWriter.deleteDocuments(new org.apache.lucene.index.Term("id", documentId.toString()));
        indexWriter.commit();
        logger.debug("Deleted document with ID: {}", documentId);
    }
    
    public List<SearchResultDto> search(String queryString, int maxResults) throws IOException, ParseException {
        if (queryString == null || queryString.trim().isEmpty()) {
            return new ArrayList<>();
        }
        
        IndexReader reader = DirectoryReader.open(directory);
        IndexSearcher searcher = new IndexSearcher(reader);
        
        String[] fields = {"title", "content"};
        MultiFieldQueryParser parser = new MultiFieldQueryParser(fields, analyzer);
        Query query = parser.parse(queryString.trim());
        
        TopDocs topDocs = searcher.search(query, maxResults);
        
        List<SearchResultDto> results = new ArrayList<>();
        
        // Setup highlighter
        QueryScorer scorer = new QueryScorer(query);
        Highlighter highlighter = new Highlighter(scorer);
        highlighter.setTextFragmenter(new SimpleSpanFragmenter(scorer, 150));
        
        for (ScoreDoc scoreDoc : topDocs.scoreDocs) {
            org.apache.lucene.document.Document doc = searcher.doc(scoreDoc.doc);
            
            SearchResultDto result = new SearchResultDto();
            result.setId(Long.parseLong(doc.get("id")));
            result.setTitle(doc.get("title"));
            result.setContent(doc.get("content"));
            result.setUrl(doc.get("url"));
            result.setScore((double) scoreDoc.score);
            
            // Generate highlighted content
            try {
                String content = doc.get("content");
                if (content != null && !content.isEmpty()) {
                    String highlightedContent = highlighter.getBestFragment(analyzer, "content", content);
                    if (highlightedContent != null) {
                        result.setHighlightedContent(highlightedContent);
                    } else {
                        // If no highlight found, use first 200 characters
                        result.setHighlightedContent(content.length() > 200 ? 
                            content.substring(0, 200) + "..." : content);
                    }
                }
            } catch (InvalidTokenOffsetsException e) {
                logger.warn("Error highlighting content for document {}: {}", result.getId(), e.getMessage());
                String content = doc.get("content");
                result.setHighlightedContent(content != null && content.length() > 200 ? 
                    content.substring(0, 200) + "..." : content);
            }
            
            results.add(result);
        }
        
        reader.close();
        logger.debug("Search for '{}' returned {} results", queryString, results.size());
        return results;
    }
    
    public List<String> getSuggestions(String partialQuery, int maxSuggestions) throws IOException {
        // Simple suggestion implementation - can be enhanced with more sophisticated algorithms
        List<String> suggestions = new ArrayList<>();
        
        if (partialQuery == null || partialQuery.trim().isEmpty()) {
            return suggestions;
        }
        
        IndexReader reader = DirectoryReader.open(directory);
        
        // This is a basic implementation - in production, you might want to use
        // Lucene's suggest module or implement a more sophisticated suggestion algorithm
        
        reader.close();
        return suggestions;
    }
    
    public void optimizeIndex() throws IOException {
        indexWriter.forceMerge(1);
        indexWriter.commit();
        logger.info("Index optimization completed");
    }
    
    public long getIndexSize() throws IOException {
        IndexReader reader = DirectoryReader.open(directory);
        long size = reader.numDocs();
        reader.close();
        return size;
    }
}