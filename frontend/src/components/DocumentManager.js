import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Alert, Spinner, Badge, Modal, Row, Col } from 'react-bootstrap';
import DocumentService from '../services/DocumentService';
import moment from 'moment';

function DocumentManager() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [stats, setStats] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  useEffect(() => {
    loadDocuments();
    loadStats();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await DocumentService.getAllDocuments();
      setDocuments(docs);
    } catch (error) {
      showMessage('Error loading documents: ' + error.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const stats = await DocumentService.getDocumentStats();
      setStats(stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const showMessage = (text, variant = 'success') => {
    setMessage({ text, variant });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await DocumentService.deleteDocument(documentId);
      showMessage('Document deleted successfully!');
      loadDocuments();
      loadStats();
    } catch (error) {
      showMessage('Error deleting document: ' + error.message, 'danger');
    }
  };

  const handleReindex = async () => {
    if (!window.confirm('This will reindex all documents. This may take some time. Continue?')) {
      return;
    }

    try {
      await DocumentService.reindexAllDocuments();
      showMessage('Reindexing started successfully! This will run in the background.');
      setTimeout(() => {
        loadDocuments();
        loadStats();
      }, 2000);
    } catch (error) {
      showMessage('Error starting reindex: ' + error.message, 'danger');
    }
  };

  const showDocumentDetails = (document) => {
    setSelectedDocument(document);
    setShowModal(true);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusBadge = (document) => {
    if (document.isIndexed) {
      return <Badge bg="success">Indexed</Badge>;
    } else {
      return <Badge bg="warning">Not Indexed</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <div className="mt-2">Loading documents...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4>Document Management</h4>
          <p className="text-muted mb-0">Manage indexed documents and monitor indexing status</p>
        </div>
        <Button variant="outline-primary" onClick={handleReindex}>
          Reindex All Documents
        </Button>
      </div>

      {message && (
        <Alert variant={message.variant} dismissible onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      {/* Statistics */}
      {stats && (
        <Row className="mb-4">
          <Col md={4}>
            <Card>
              <Card.Body className="text-center">
                <h3 className="text-primary">{stats.indexedCount || 0}</h3>
                <p className="text-muted mb-0">Indexed Documents</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card>
              <Card.Body className="text-center">
                <h3 className="text-info">{documents.length}</h3>
                <p className="text-muted mb-0">Total Documents</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card>
              <Card.Body className="text-center">
                <h3 className="text-warning">
                  {documents.filter(d => !d.isIndexed).length}
                </h3>
                <p className="text-muted mb-0">Pending Index</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Document Types Statistics */}
      {stats && stats.statsByContentType && stats.statsByContentType.length > 0 && (
        <Card className="mb-4">
          <Card.Header>
            <h6 className="mb-0">Documents by Content Type</h6>
          </Card.Header>
          <Card.Body>
            <Row>
              {stats.statsByContentType.map(([contentType, count], index) => (
                <Col key={index} md={3} className="mb-2">
                  <div className="text-center">
                    <div className="fw-bold">{count}</div>
                    <div className="text-muted small">{contentType || 'Unknown'}</div>
                  </div>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Documents Table */}
      <Card>
        <Card.Header>
          <h6 className="mb-0">All Documents ({documents.length})</h6>
        </Card.Header>
        <Card.Body className="p-0">
          {documents.length > 0 ? (
            <Table responsive hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Title</th>
                  <th>URL</th>
                  <th>Content Type</th>
                  <th>Size</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((document) => (
                  <tr key={document.id}>
                    <td>
                      <div className="fw-bold">{document.title}</div>
                      {document.content && (
                        <div className="text-muted small">
                          {document.content.length > 100
                            ? document.content.substring(0, 100) + '...'
                            : document.content
                          }
                        </div>
                      )}
                    </td>
                    <td>
                      <a
                        href={document.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-decoration-none"
                      >
                        {document.url.length > 40
                          ? document.url.substring(0, 40) + '...'
                          : document.url
                        }
                      </a>
                    </td>
                    <td>
                      <Badge bg="secondary">
                        {document.contentType || 'text/plain'}
                      </Badge>
                    </td>
                    <td>{formatFileSize(document.fileSize)}</td>
                    <td>{getStatusBadge(document)}</td>
                    <td>{moment(document.createdAt).format('MMM D, YYYY')}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          size="sm"
                          variant="outline-info"
                          onClick={() => showDocumentDetails(document)}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => handleDelete(document.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center py-5">
              <h5>No documents found</h5>
              <p className="text-muted">
                Start by uploading documents through the Document Upload tab.
              </p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Document Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Document Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDocument && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Title:</strong>
                  <div>{selectedDocument.title}</div>
                </Col>
                <Col md={6}>
                  <strong>Status:</strong>
                  <div>{getStatusBadge(selectedDocument)}</div>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Content Type:</strong>
                  <div>{selectedDocument.contentType || 'text/plain'}</div>
                </Col>
                <Col md={6}>
                  <strong>File Size:</strong>
                  <div>{formatFileSize(selectedDocument.fileSize)}</div>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Created:</strong>
                  <div>{moment(selectedDocument.createdAt).format('MMMM D, YYYY [at] h:mm A')}</div>
                </Col>
                <Col md={6}>
                  <strong>Last Indexed:</strong>
                  <div>
                    {selectedDocument.indexedAt 
                      ? moment(selectedDocument.indexedAt).format('MMMM D, YYYY [at] h:mm A')
                      : 'Never'
                    }
                  </div>
                </Col>
              </Row>
              
              <div className="mb-3">
                <strong>URL:</strong>
                <div>
                  <a href={selectedDocument.url} target="_blank" rel="noopener noreferrer">
                    {selectedDocument.url}
                  </a>
                </div>
              </div>
              
              {selectedDocument.filePath && (
                <div className="mb-3">
                  <strong>File Path:</strong>
                  <div><code>{selectedDocument.filePath}</code></div>
                </div>
              )}
              
              <div>
                <strong>Content Preview:</strong>
                <div className="border rounded p-3 mt-2" style={{maxHeight: '200px', overflowY: 'auto'}}>
                  {selectedDocument.content || 'No content available'}
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default DocumentManager;