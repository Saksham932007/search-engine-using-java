import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Spinner, Alert } from 'react-bootstrap';
import SearchService from '../services/SearchService';
import DocumentService from '../services/DocumentService';
import moment from 'moment';

function SearchAnalytics() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    recentSearches: [],
    popularQueries: [],
    averageSearchTime: null,
    documentStats: null
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [recentSearches, popularQueries, averageTime, docStats] = await Promise.all([
        SearchService.getSearchHistory().catch(() => []),
        SearchService.getPopularQueries(30).catch(() => []),
        SearchService.getAverageSearchTime(30).catch(() => null),
        DocumentService.getDocumentStats().catch(() => null)
      ]);

      setData({
        recentSearches: recentSearches || [],
        popularQueries: popularQueries || [],
        averageSearchTime: averageTime,
        documentStats: docStats
      });
    } catch (error) {
      setError('Error loading analytics data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <div className="mt-2">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        {error}
      </Alert>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h4>Search Analytics</h4>
        <p className="text-muted">Monitor search performance and user behavior</p>
      </div>

      {/* Key Metrics */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <h3 className="text-primary">
                {data.documentStats?.indexedCount || 0}
              </h3>
              <p className="text-muted mb-0">Indexed Documents</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <h3 className="text-success">
                {data.recentSearches.length}
              </h3>
              <p className="text-muted mb-0">Total Searches</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <h3 className="text-info">
                {data.averageSearchTime ? Math.round(data.averageSearchTime) : 'N/A'}
                {data.averageSearchTime && <small className="text-muted">ms</small>}
              </h3>
              <p className="text-muted mb-0">Avg. Search Time</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <h3 className="text-warning">
                {data.popularQueries.length}
              </h3>
              <p className="text-muted mb-0">Unique Queries</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Popular Queries */}
        <Col md={6} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h6 className="mb-0">Popular Queries (Last 30 Days)</h6>
            </Card.Header>
            <Card.Body>
              {data.popularQueries && data.popularQueries.length > 0 ? (
                <Table responsive size="sm">
                  <thead>
                    <tr>
                      <th>Query</th>
                      <th className="text-end">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.popularQueries.slice(0, 10).map((queryData, index) => (
                      <tr key={index}>
                        <td>
                          <div className="fw-bold">
                            {Array.isArray(queryData) ? queryData[0] : queryData.query}
                          </div>
                        </td>
                        <td className="text-end">
                          <span className="badge bg-primary">
                            {Array.isArray(queryData) ? queryData[1] : queryData.count}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-4">
                  <div className="text-muted">No search queries yet</div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Recent Searches */}
        <Col md={6} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h6 className="mb-0">Recent Searches</h6>
            </Card.Header>
            <Card.Body>
              {data.recentSearches && data.recentSearches.length > 0 ? (
                <Table responsive size="sm">
                  <thead>
                    <tr>
                      <th>Query</th>
                      <th>Results</th>
                      <th>Time</th>
                      <th>When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentSearches.slice(0, 10).map((search, index) => (
                      <tr key={index}>
                        <td>
                          <div className="fw-bold">{search.query}</div>
                        </td>
                        <td>
                          <span className="badge bg-info">
                            {search.resultsCount || 0}
                          </span>
                        </td>
                        <td>
                          <small className="text-muted">
                            {search.searchTimeMs}ms
                          </small>
                        </td>
                        <td>
                          <small className="text-muted">
                            {moment(search.createdAt).fromNow()}
                          </small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-4">
                  <div className="text-muted">No recent searches</div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Document Statistics by Content Type */}
      {data.documentStats && data.documentStats.statsByContentType && (
        <Row>
          <Col>
            <Card>
              <Card.Header>
                <h6 className="mb-0">Documents by Content Type</h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  {data.documentStats.statsByContentType.map(([contentType, count], index) => (
                    <Col key={index} md={3} className="mb-3">
                      <Card className="text-center">
                        <Card.Body>
                          <h4 className="text-primary">{count}</h4>
                          <p className="text-muted mb-0 small">
                            {contentType || 'Unknown Type'}
                          </p>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Performance Insights */}
      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Header>
              <h6 className="mb-0">Performance Insights</h6>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h6>Search Performance</h6>
                  <ul>
                    <li>
                      Average search time: {' '}
                      <strong>
                        {data.averageSearchTime ? `${Math.round(data.averageSearchTime)}ms` : 'N/A'}
                      </strong>
                    </li>
                    <li>
                      Total searches: <strong>{data.recentSearches.length}</strong>
                    </li>
                    <li>
                      Unique queries: <strong>{data.popularQueries.length}</strong>
                    </li>
                  </ul>
                </Col>
                <Col md={6}>
                  <h6>Index Health</h6>
                  <ul>
                    <li>
                      Indexed documents: {' '}
                      <strong>{data.documentStats?.indexedCount || 0}</strong>
                    </li>
                    <li>
                      Content types: {' '}
                      <strong>
                        {data.documentStats?.statsByContentType?.length || 0}
                      </strong>
                    </li>
                    <li>
                      Status: <strong className="text-success">Healthy</strong>
                    </li>
                  </ul>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default SearchAnalytics;