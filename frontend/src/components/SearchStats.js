import React, { useState, useEffect } from 'react';
import { Card, Spinner } from 'react-bootstrap';
import SearchService from '../services/SearchService';
import DocumentService from '../services/DocumentService';

function SearchStats() {
  const [stats, setStats] = useState({
    averageSearchTime: null,
    popularQueries: [],
    documentCount: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      const [avgTime, popular, docStats] = await Promise.all([
        SearchService.getAverageSearchTime(7).catch(() => null),
        SearchService.getPopularQueries(7).catch(() => []),
        DocumentService.getDocumentStats().catch(() => null)
      ]);

      setStats({
        averageSearchTime: avgTime,
        popularQueries: popular || [],
        documentCount: docStats?.indexedCount || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="stats-container">
        <Card.Body className="text-center">
          <Spinner animation="border" size="sm" />
          <div className="mt-2">Loading stats...</div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div className="stats-container">
      <h6 className="mb-3 text-muted">Search Statistics</h6>
      
      {/* Document Count */}
      <div className="stats-item">
        <div className="stats-number">
          {stats.documentCount || 0}
        </div>
        <div className="stats-label">Indexed Documents</div>
      </div>

      {/* Average Search Time */}
      {stats.averageSearchTime && (
        <div className="stats-item">
          <div className="stats-number">
            {Math.round(stats.averageSearchTime)}ms
          </div>
          <div className="stats-label">Avg. Search Time</div>
        </div>
      )}

      {/* Popular Queries */}
      {stats.popularQueries && stats.popularQueries.length > 0 && (
        <div className="mt-3">
          <h6 className="text-muted">Popular Queries (7 days)</h6>
          <div className="mt-2">
            {stats.popularQueries.slice(0, 5).map((queryData, index) => (
              <div key={index} className="d-flex justify-content-between mb-2">
                <small className="text-truncate me-2">
                  {Array.isArray(queryData) ? queryData[0] : queryData.query}
                </small>
                <small className="text-muted">
                  {Array.isArray(queryData) ? queryData[1] : queryData.count}
                </small>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-4">
        <h6 className="text-muted">Quick Actions</h6>
        <div className="d-grid gap-2">
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => window.open('/admin', '_blank')}
          >
            Admin Panel
          </button>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => window.open('http://localhost:8080/h2-console', '_blank')}
          >
            Database Console
          </button>
        </div>
      </div>
    </div>
  );
}

export default SearchStats;