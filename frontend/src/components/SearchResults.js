import React from 'react';
import { Card, Row, Col, Pagination, Badge, Alert } from 'react-bootstrap';
import moment from 'moment';

function SearchResults({ results, onPageChange, currentPage }) {
  if (!results) {
    return null;
  }

  const { results: searchResults, totalResults, searchTimeMs, query, pageSize } = results;
  const totalPages = Math.ceil(totalResults / pageSize);

  const handlePageClick = (page) => {
    if (page >= 0 && page < totalPages) {
      onPageChange(page);
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const items = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    // Previous button
    items.push(
      <Pagination.Prev
        key="prev"
        disabled={currentPage === 0}
        onClick={() => handlePageClick(currentPage - 1)}
      />
    );

    // First page
    if (startPage > 0) {
      items.push(
        <Pagination.Item key={0} onClick={() => handlePageClick(0)}>
          1
        </Pagination.Item>
      );
      if (startPage > 1) {
        items.push(<Pagination.Ellipsis key="start-ellipsis" />);
      }
    }

    // Page numbers
    for (let page = startPage; page <= endPage; page++) {
      items.push(
        <Pagination.Item
          key={page}
          active={page === currentPage}
          onClick={() => handlePageClick(page)}
        >
          {page + 1}
        </Pagination.Item>
      );
    }

    // Last page
    if (endPage < totalPages - 1) {
      if (endPage < totalPages - 2) {
        items.push(<Pagination.Ellipsis key="end-ellipsis" />);
      }
      items.push(
        <Pagination.Item
          key={totalPages - 1}
          onClick={() => handlePageClick(totalPages - 1)}
        >
          {totalPages}
        </Pagination.Item>
      );
    }

    // Next button
    items.push(
      <Pagination.Next
        key="next"
        disabled={currentPage >= totalPages - 1}
        onClick={() => handlePageClick(currentPage + 1)}
      />
    );

    return (
      <div className="pagination-container">
        <Pagination>{items}</Pagination>
      </div>
    );
  };

  const highlightText = (text, query) => {
    if (!text || !query) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={index} className="highlighted">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div>
      {/* Search Info */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="mb-1">
              Search Results for "{query}"
            </h5>
            <p className="text-muted mb-0">
              About {totalResults} results ({searchTimeMs}ms)
            </p>
          </div>
          {results.suggestions && results.suggestions.length > 0 && (
            <div>
              <small className="text-muted">Suggestions:</small>
              <div>
                {results.suggestions.map((suggestion, index) => (
                  <Badge key={index} bg="light" text="dark" className="me-1">
                    {suggestion}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {searchResults && searchResults.length > 0 ? (
        <div>
          {searchResults.map((result, index) => (
            <Card key={result.id || index} className="result-card">
              <Card.Body>
                <Row>
                  <Col>
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="result-title"
                    >
                      {highlightText(result.title, query)}
                    </a>
                    
                    <div className="result-url">
                      {result.url}
                    </div>
                    
                    <div className="result-content">
                      {result.highlightedContent 
                        ? <div dangerouslySetInnerHTML={{ 
                            __html: result.highlightedContent.replace(
                              new RegExp(`(${query})`, 'gi'), 
                              '<span class="highlighted">$1</span>'
                            ) 
                          }} />
                        : highlightText(
                            result.content 
                              ? (result.content.length > 200 
                                  ? result.content.substring(0, 200) + '...' 
                                  : result.content)
                              : 'No content available',
                            query
                          )
                      }
                    </div>
                    
                    <div className="result-meta">
                      <div>
                        {result.createdAt && (
                          <span>
                            Indexed: {moment(result.createdAt).format('MMM D, YYYY')}
                          </span>
                        )}
                      </div>
                      <div>
                        {result.score && (
                          <span className="score-badge">
                            Score: {result.score.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))}

          {/* Pagination */}
          {renderPagination()}
        </div>
      ) : (
        <div className="no-results">
          <Alert variant="info">
            <h3>No results found</h3>
            <p>
              We couldn't find any documents matching your search query "{query}".
            </p>
            <hr />
            <p className="mb-0">
              <strong>Suggestions:</strong>
            </p>
            <ul className="text-start mt-2">
              <li>Check your spelling</li>
              <li>Try different keywords</li>
              <li>Use more general terms</li>
              <li>Make sure documents are indexed through the Admin panel</li>
            </ul>
          </Alert>
        </div>
      )}
    </div>
  );
}

export default SearchResults;