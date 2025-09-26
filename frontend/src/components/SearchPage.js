import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner, Badge } from 'react-bootstrap';
import SearchService from '../services/SearchService';
import SearchResults from './SearchResults';
import SearchStats from './SearchStats';

function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    try {
      const history = await SearchService.getSearchHistory();
      setRecentSearches(history.slice(0, 5));
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  const handleSearch = async (searchQuery = query, page = 0) => {
    if (!searchQuery || searchQuery.trim() === '') {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await SearchService.search(searchQuery, page, pageSize);
      setResults(response);
      setCurrentPage(page);
      if (page === 0) {
        loadRecentSearches(); // Refresh recent searches
      }
    } catch (error) {
      setError('An error occurred while searching. Please try again.');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  const handlePageChange = (page) => {
    handleSearch(query, page);
  };

  const handleRecentSearchClick = (recentQuery) => {
    setQuery(recentQuery);
    handleSearch(recentQuery, 0);
  };

  return (
    <div className="search-container">
      <Container className="py-5">
        {/* Search Header */}
        <Row className="justify-content-center mb-5">
          <Col lg={8}>
            <div className="text-center mb-4">
              <h1 className="display-4 text-white fw-bold mb-3">
                Java Search Engine
              </h1>
              <p className="text-white-50 lead">
                Powered by Apache Lucene for fast and accurate search results
              </p>
            </div>

            {/* Search Form */}
            <Form onSubmit={handleSubmit}>
              <div className="search-box d-flex">
                <Form.Control
                  type="text"
                  placeholder="Enter your search query..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="search-input"
                  size="lg"
                />
                <Button type="submit" className="search-btn" disabled={loading}>
                  {loading ? <Spinner animation="border" size="sm" /> : 'Search'}
                </Button>
              </div>
            </Form>

            {error && (
              <Alert variant="danger" className="mt-3">
                {error}
              </Alert>
            )}
          </Col>
        </Row>

        {/* Recent Searches */}
        {!results && recentSearches.length > 0 && (
          <Row className="justify-content-center mb-4">
            <Col lg={8}>
              <Card className="text-center">
                <Card.Body>
                  <h6 className="text-muted mb-3">Recent Searches</h6>
                  <div>
                    {recentSearches.map((search, index) => (
                      <Badge
                        key={index}
                        bg="secondary"
                        className="me-2 mb-2 p-2"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleRecentSearchClick(search.query)}
                      >
                        {search.query}
                      </Badge>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Search Results */}
        {results && (
          <Row>
            <Col lg={9}>
              <SearchResults 
                results={results}
                onPageChange={handlePageChange}
                currentPage={currentPage}
              />
            </Col>
            <Col lg={3}>
              <SearchStats />
            </Col>
          </Row>
        )}

        {/* Sample Queries for Empty State */}
        {!results && !loading && (
          <Row className="justify-content-center">
            <Col lg={8}>
              <Card className="text-center">
                <Card.Body>
                  <h5>Welcome to Java Search Engine!</h5>
                  <p className="text-muted">
                    To get started, index some documents through the Admin panel, 
                    then search for content using the search box above.
                  </p>
                  <div className="mt-3">
                    <Button 
                      variant="outline-primary" 
                      className="me-2"
                      onClick={() => handleRecentSearchClick('java')}
                    >
                      Try: "java"
                    </Button>
                    <Button 
                      variant="outline-primary" 
                      className="me-2"
                      onClick={() => handleRecentSearchClick('spring')}
                    >
                      Try: "spring"
                    </Button>
                    <Button 
                      variant="outline-primary"
                      onClick={() => handleRecentSearchClick('search')}
                    >
                      Try: "search"
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
}

export default SearchPage;